import { useMemo, useState } from 'react'
import { Bell, ChevronDown, CircleUserRound, CloudSun } from 'lucide-react'
import { BrandMark } from './components/BrandMark'
import { GearVault } from './features/inventory/GearVault'
import { ItemInspector } from './features/inventory/ItemInspector'
import { seedInventory } from './features/inventory/seedItems'
import { ActiveLoadout } from './features/loadouts/ActiveLoadout'
import type { LoadoutEntry } from './types/gear'

export default function App() {
  const { gearItems: items, categories, userSettings } = seedInventory
  const [entries, setEntries] = useState<LoadoutEntry[]>(
    seedInventory.loadouts[0].entries,
  )
  const [selectedId, setSelectedId] = useState(items[0].id)
  const [query, setQuery] = useState('')
  const categoryLabels = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [category.id, category.label]),
      ),
    [categories],
  )
  const itemsById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  )
  const packedItemIds = new Set(entries.map((entry) => entry.gearItemId))
  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        `${item.name} ${item.brand} ${categoryLabels[item.categoryId]}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [items, query, categoryLabels],
  )
  const selected = items.find((item) => item.id === selectedId) ?? items[0]
  const togglePacked = (id: string) =>
    setEntries((current) => {
      const existing = current.find((entry) => entry.gearItemId === id)
      if (existing) return current.filter((entry) => entry.id !== existing.id)

      return [
        ...current,
        {
          id: `olympic-traverse-${id}`,
          gearItemId: id,
          quantity: 1,
          packed: true,
          carryClassification: 'carried',
        },
      ]
    })

  return (
    <div id="top" className="app-shell">
      <header className="hud">
        <BrandMark />
        <nav aria-label="Primary navigation">
          <a className="active" href="#vault-title">
            Vault
          </a>
          <a href="#loadout-title">Loadouts</a>
        </nav>
        <div className="hud__right">
          <span className="weather">
            <CloudSun size={17} /> 54°F · Olympic NP
          </span>
          <button className="icon-button ghost" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button className="profile" aria-label="Open profile">
            <CircleUserRound size={22} />
            <span>Alex</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </header>
      <main className="workspace">
        <GearVault
          items={filteredItems}
          selectedId={selectedId}
          query={query}
          onQueryChange={setQuery}
          onSelect={setSelectedId}
          onTogglePacked={togglePacked}
          packedItemIds={packedItemIds}
          categoryLabels={categoryLabels}
          displayWeightUnit={userSettings.displayWeightUnit}
        />
        <ActiveLoadout
          itemsById={itemsById}
          loadout={{ ...seedInventory.loadouts[0], entries }}
          capacity={userSettings.carryCapacityGrams}
          categoryLabels={categoryLabels}
          displayWeightUnit={userSettings.displayWeightUnit}
          onRemove={togglePacked}
        />
        <ItemInspector
          item={selected}
          categoryLabel={categoryLabels[selected.categoryId]}
          displayWeightUnit={userSettings.displayWeightUnit}
          isInLoadout={packedItemIds.has(selected.id)}
        />
      </main>
      <footer>
        <span>Pack lighter. Go farther.</span>
        <span>PackDB / Field build 0.1</span>
      </footer>
    </div>
  )
}
