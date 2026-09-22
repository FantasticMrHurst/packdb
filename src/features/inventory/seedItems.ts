import type { GearItem } from '../../types/gear'

export const seedItems: GearItem[] = [
  {
    id: 'tent',
    name: 'Copper Spur HV UL2',
    brand: 'Big Agnes',
    category: 'Shelter',
    weightGrams: 1420,
    description:
      'Freestanding two-person shelter with a roomy interior and fast-pitch option.',
    color: '#d8a94a',
    packed: true,
  },
  {
    id: 'quilt',
    name: 'Revelation 20° Quilt',
    brand: 'Enlightened Equipment',
    category: 'Sleep',
    weightGrams: 624,
    description:
      'Versatile down quilt rated for three-season nights and minimal packed volume.',
    color: '#c8673f',
    packed: true,
  },
  {
    id: 'pad',
    name: 'Tensor All-Season',
    brand: 'NEMO',
    category: 'Sleep',
    weightGrams: 440,
    description:
      'Insulated sleeping pad balancing warmth, comfort, and trail-ready weight.',
    color: '#769c70',
    packed: false,
  },
  {
    id: 'stove',
    name: 'PocketRocket Deluxe',
    brand: 'MSR',
    category: 'Cooking',
    weightGrams: 83,
    description:
      'Compact canister stove with pressure regulation and a built-in piezo igniter.',
    color: '#bd4c3f',
    packed: true,
  },
  {
    id: 'filter',
    name: 'Squeeze Filter',
    brand: 'Sawyer',
    category: 'Water',
    weightGrams: 85,
    description:
      'Field-serviceable hollow-fiber water filter for bottles and gravity systems.',
    color: '#4f8d9d',
    packed: true,
  },
  {
    id: 'lamp',
    name: 'Actik Core 600',
    brand: 'Petzl',
    category: 'Tools',
    weightGrams: 88,
    description:
      'Rechargeable headlamp with a broad mixed beam and red-light mode.',
    color: '#c7b04b',
    packed: false,
  },
]
