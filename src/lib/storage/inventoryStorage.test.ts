import { describe, expect, it } from 'vitest'
import { seedInventory } from '../../features/inventory/seedItems'
import {
  deserializeInventory,
  mergeInventory,
  serializeInventory,
  validateInventory,
} from './inventoryStorage'

describe('inventory persistence', () => {
  it('round trips a complete inventory', () => {
    expect(deserializeInventory(serializeInventory(seedInventory))).toEqual(seedInventory)
  })

  it('rejects corrupt JSON and invalid records', () => {
    expect(deserializeInventory('{oops')).toBeNull()
    expect(validateInventory({ ...seedInventory, gearItems: [{ id: 'broken' }] })).toBeNull()
  })

  it('migrates schema version 1 records', () => {
    const legacy = { ...seedInventory, schemaVersion: 1 }
    expect(validateInventory(legacy)).toEqual({ ...seedInventory, schemaVersion: 2 })
  })

  it('keeps existing records and reports merge conflicts', () => {
    const incoming = {
      ...seedInventory,
      gearItems: [seedInventory.gearItems[0], { ...seedInventory.gearItems[1], id: 'new-quilt' }],
      categories: [],
      loadouts: [],
    }
    const result = mergeInventory(seedInventory, incoming)
    expect(result.inventory.gearItems).toHaveLength(seedInventory.gearItems.length + 1)
    expect(result.rejected).toEqual(['Item “tent” conflicts with an existing record'])
  })
})
