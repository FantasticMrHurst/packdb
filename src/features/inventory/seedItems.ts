import {
  CURRENT_SCHEMA_VERSION,
  type GearItem,
  type PersistedInventory,
} from '../../types/gear'

export const seedItems: GearItem[] = [
  [
    'tent',
    'Copper Spur HV UL2',
    'Big Agnes',
    'shelter',
    1420,
    '#d8a94a',
    'Freestanding two-person shelter with a roomy interior and fast-pitch option.',
  ],
  [
    'quilt',
    'Revelation 20° Quilt',
    'Enlightened Equipment',
    'sleep',
    624,
    '#c8673f',
    'Versatile down quilt rated for three-season nights and minimal packed volume.',
  ],
  [
    'pad',
    'Tensor All-Season',
    'NEMO',
    'sleep',
    440,
    '#769c70',
    'Insulated sleeping pad balancing warmth, comfort, and trail-ready weight.',
  ],
  [
    'stove',
    'PocketRocket Deluxe',
    'MSR',
    'cooking',
    83,
    '#bd4c3f',
    'Compact canister stove with pressure regulation and a built-in piezo igniter.',
  ],
  [
    'filter',
    'Squeeze Filter',
    'Sawyer',
    'water',
    85,
    '#4f8d9d',
    'Field-serviceable hollow-fiber water filter for bottles and gravity systems.',
  ],
  [
    'lamp',
    'Actik Core 600',
    'Petzl',
    'tools',
    88,
    '#c7b04b',
    'Rechargeable headlamp with a broad mixed beam and red-light mode.',
  ],
].map(([id, name, brand, categoryId, weightGrams, color, description]) => ({
  id: id as string,
  name: name as string,
  brand: brand as string,
  categoryId: categoryId as string,
  weightGrams: weightGrams as number,
  weightUnit: 'g',
  color: color as string,
  description: description as string,
}))

export const seedInventory: PersistedInventory = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  gearItems: seedItems,
  categories: [
    { id: 'shelter', label: 'Shelter' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'cooking', label: 'Cooking' },
    { id: 'water', label: 'Water' },
    { id: 'tools', label: 'Tools' },
  ],
  loadouts: [
    {
      id: 'olympic-traverse',
      name: 'Olympic Traverse',
      entries: ['tent', 'quilt', 'stove', 'filter'].map((gearItemId) => ({
        id: `olympic-traverse-${gearItemId}`,
        gearItemId,
        quantity: 1,
        packed: true,
        carryClassification: 'carried',
      })),
    },
  ],
  userSettings: { displayWeightUnit: 'kg', carryCapacityGrams: 3200 },
}
