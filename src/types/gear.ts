export type GearCategory = 'Shelter' | 'Sleep' | 'Cooking' | 'Water' | 'Tools'

export interface GearItem {
  id: string
  name: string
  brand: string
  category: GearCategory
  weightGrams: number
  description: string
  color: string
  packed: boolean
}
