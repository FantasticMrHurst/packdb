/** The only unit used for weights at rest. */
export type CanonicalWeightUnit = 'g'

/** Units a user can choose when a canonical weight is displayed. */
export type DisplayWeightUnit = 'g' | 'kg' | 'oz' | 'lb'

export type CarryClassification = 'carried' | 'worn' | 'consumable'

export type GearItemId = string
export type CategoryId = string
export type LoadoutId = string
export type LoadoutEntryId = string

export interface GearCategory {
  /** Stable storage key. The label may be edited without changing this value. */
  id: CategoryId
  label: string
}

/** A reusable item in the gear vault. Trip state belongs on LoadoutEntry. */
export interface GearItem {
  id: GearItemId
  name: string
  brand: string
  photoUrl?: string
  productUrl?: string
  /** Integer grams. Values are converted only when rendered. */
  weightGrams: number
  weightUnit: CanonicalWeightUnit
  categoryId: CategoryId
  description?: string
  notes?: string
  tags?: string[]
  color: string
}

/** The trip-specific use of a reusable vault item. */
export interface LoadoutEntry {
  id: LoadoutEntryId
  gearItemId: GearItemId
  quantity: number
  packed: boolean
  carryClassification: CarryClassification
}

export interface Loadout {
  id: LoadoutId
  name: string
  entries: LoadoutEntry[]
}

export interface UserSettings {
  displayWeightUnit: DisplayWeightUnit
  /** Integer grams, regardless of displayWeightUnit. */
  carryCapacityGrams: number
}

export const CURRENT_SCHEMA_VERSION = 2 as const

/** Versioned shape suitable for local or remote persistence. */
export interface PersistedInventory {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION
  gearItems: GearItem[]
  categories: GearCategory[]
  loadouts: Loadout[]
  userSettings: UserSettings
}
