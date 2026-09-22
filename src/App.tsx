import { useMemo, useState } from 'react'
import { Bell, ChevronDown, CircleUserRound, CloudSun } from 'lucide-react'
import { BrandMark } from './components/BrandMark'
import { GearVault } from './features/inventory/GearVault'
import { ItemInspector } from './features/inventory/ItemInspector'
import { seedItems } from './features/inventory/seedItems'
import { ActiveLoadout } from './features/loadouts/ActiveLoadout'
import type { GearItem } from './types/gear'

export default function App() {
  const [items, setItems] = useState<GearItem[]>(seedItems)
  const [selectedId, setSelectedId] = useState(seedItems[0].id)
  const [query, setQuery] = useState('')
  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        `${item.name} ${item.brand} ${item.category}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [items, query],
  )
  const selected = items.find((item) => item.id === selectedId) ?? items[0]
  const togglePacked = (id: string) =>
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item,
      ),
    )

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
        />
        <ActiveLoadout
          items={items.filter((item) => item.packed)}
          capacity={3200}
          onRemove={togglePacked}
        />
        <ItemInspector item={selected} />
      </main>
      <footer>
        <span>Pack lighter. Go farther.</span>
        <span>PackDB / Field build 0.1</span>
      </footer>
    </div>
  )
}
