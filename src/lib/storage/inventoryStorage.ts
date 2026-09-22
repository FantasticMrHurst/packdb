import {
  CURRENT_SCHEMA_VERSION,
  type GearCategory,
  type GearItem,
  type Loadout,
  type PersistedInventory,
  type UserSettings,
} from '../../types/gear'

export const STORAGE_KEY = 'packdb.inventory'

export interface StorageAdapter {
  load(): Promise<PersistedInventory | null>
  save(inventory: PersistedInventory): Promise<void>
}

export interface ImportResult {
  inventory: PersistedInventory
  rejected: string[]
}

type JsonRecord = Record<string, unknown>

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === 'string'
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const validCategory = (value: unknown): value is GearCategory =>
  isRecord(value) && isString(value.id) && isString(value.label)

const validItem = (value: unknown): value is GearItem =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.name) &&
  isString(value.brand) &&
  (!('photoUrl' in value) ||
    value.photoUrl === undefined ||
    isString(value.photoUrl)) &&
  (!('productUrl' in value) ||
    value.productUrl === undefined ||
    isString(value.productUrl)) &&
  isFiniteNumber(value.weightGrams) &&
  value.weightGrams >= 0 &&
  value.weightUnit === 'g' &&
  (!('displayWeightUnit' in value) ||
    value.displayWeightUnit === undefined ||
    ['g', 'kg', 'oz', 'lb'].includes(value.displayWeightUnit as string)) &&
  isString(value.categoryId) &&
  isString(value.color)

const validEntry = (value: unknown) =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.gearItemId) &&
  Number.isInteger(value.quantity) &&
  (value.quantity as number) > 0 &&
  typeof value.packed === 'boolean' &&
  ['carried', 'worn', 'consumable'].includes(
    value.carryClassification as string,
  )

const validLoadout = (value: unknown): value is Loadout =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.name) &&
  Array.isArray(value.entries) &&
  value.entries.every(validEntry)

const validSettings = (value: unknown): value is UserSettings =>
  isRecord(value) &&
  ['g', 'kg', 'oz', 'lb'].includes(value.displayWeightUnit as string) &&
  isFiniteNumber(value.carryCapacityGrams) &&
  value.carryCapacityGrams >= 0

const migrations: Record<number, (record: JsonRecord) => JsonRecord> = {
  1: (record) => ({ ...record, schemaVersion: 2 }),
}

/** Upgrade older records one schema version at a time. */
export function migrateStoredData(value: unknown): unknown {
  if (!isRecord(value)) return value
  let migrated: JsonRecord = { ...value }
  while (
    typeof migrated.schemaVersion === 'number' &&
    migrated.schemaVersion < CURRENT_SCHEMA_VERSION
  ) {
    const migration = migrations[migrated.schemaVersion]
    if (!migration) return null
    migrated = migration(migrated)
  }
  return migrated
}

export function validateInventory(value: unknown): PersistedInventory | null {
  const migrated = migrateStoredData(value)
  if (
    !isRecord(migrated) ||
    migrated.schemaVersion !== CURRENT_SCHEMA_VERSION ||
    !Array.isArray(migrated.gearItems) ||
    !migrated.gearItems.every(validItem) ||
    !Array.isArray(migrated.categories) ||
    !migrated.categories.every(validCategory) ||
    !Array.isArray(migrated.loadouts) ||
    !migrated.loadouts.every(validLoadout) ||
    !validSettings(migrated.userSettings)
  )
    return null

  return migrated as unknown as PersistedInventory
}

export function deserializeInventory(json: string): PersistedInventory | null {
  try {
    return validateInventory(JSON.parse(json))
  } catch {
    return null
  }
}

export function serializeInventory(inventory: PersistedInventory): string {
  return JSON.stringify(inventory, null, 2)
}

export function mergeInventory(
  current: PersistedInventory,
  incoming: PersistedInventory,
): ImportResult {
  const rejected: string[] = []
  const mergeUnique = <T extends { id: string }>(
    label: string,
    a: T[],
    b: T[],
  ) => {
    const result = [...a]
    const ids = new Set(a.map(({ id }) => id))
    for (const record of b) {
      if (ids.has(record.id))
        rejected.push(
          `${label} “${record.id}” conflicts with an existing record`,
        )
      else {
        result.push(record)
        ids.add(record.id)
      }
    }
    return result
  }
  return {
    inventory: {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      gearItems: mergeUnique('Item', current.gearItems, incoming.gearItems),
      categories: mergeUnique(
        'Category',
        current.categories,
        incoming.categories,
      ),
      loadouts: mergeUnique('Loadout', current.loadouts, incoming.loadouts),
      userSettings: current.userSettings,
    },
    rejected,
  }
}

/** Small structured records and remote photo URLs fit localStorage; no image blobs are stored. */
export function createLocalStorageAdapter(
  storage: Storage = window.localStorage,
): StorageAdapter {
  return {
    async load() {
      const raw = storage.getItem(STORAGE_KEY)
      if (!raw) return null
      const inventory = deserializeInventory(raw)
      if (!inventory)
        throw new Error('Stored inventory is malformed or unsupported')
      return inventory
    },
    async save(inventory) {
      storage.setItem(STORAGE_KEY, serializeInventory(inventory))
    },
  }
}
