import { Check, Plus, Search, SlidersHorizontal } from 'lucide-react'
import type { GearItem } from '../../types/gear'
import { formatWeight } from '../../lib/weight'

interface Props {
  items: GearItem[]
  selectedId: string
  query: string
  onQueryChange: (query: string) => void
  onSelect: (id: string) => void
  onTogglePacked: (id: string) => void
}

export function GearVault({
  items,
  selectedId,
  query,
  onQueryChange,
  onSelect,
  onTogglePacked,
}: Props) {
  return (
    <section className="panel vault" aria-labelledby="vault-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 id="vault-title">Gear Vault</h1>
        </div>
        <span className="count">{items.length} items</span>
      </div>
      <div className="search-row">
        <label className="search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search gear</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search your gear..."
          />
        </label>
        <button className="icon-button" aria-label="Filter gear">
          <SlidersHorizontal size={18} />
        </button>
      </div>
      <div className="gear-list">
        {items.map((item) => (
          <article
            className={`gear-card ${selectedId === item.id ? 'is-selected' : ''}`}
            key={item.id}
          >
            <button
              className="gear-card__main"
              onClick={() => onSelect(item.id)}
              aria-label={`Inspect ${item.name}`}
            >
              <span
                className="gear-thumb"
                style={{ '--accent': item.color } as React.CSSProperties}
                aria-hidden="true"
              >
                {item.name.charAt(0)}
              </span>
              <span className="gear-card__copy">
                <strong>{item.name}</strong>
                <span>
                  {item.brand} · {item.category}
                </span>
              </span>
              <span className="gear-weight">
                {formatWeight(item.weightGrams)}
              </span>
            </button>
            <button
              className={`pack-toggle ${item.packed ? 'is-packed' : ''}`}
              onClick={() => onTogglePacked(item.id)}
              aria-label={`${item.packed ? 'Remove' : 'Add'} ${item.name} ${item.packed ? 'from' : 'to'} loadout`}
            >
              {item.packed ? <Check size={16} /> : <Plus size={16} />}
            </button>
          </article>
        ))}
        {items.length === 0 && (
          <p className="empty">No gear matches “{query}”.</p>
        )}
      </div>
    </section>
  )
}
