import { useState } from 'react'
import {
  Check,
  Copy,
  Edit3,
  ImageOff,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import type {
  DisplayWeightUnit,
  GearCategory,
  GearItem,
} from '../../types/gear'
import { formatWeight } from '../../lib/weight'

export type SortOption = 'name' | 'weight' | 'category' | 'modified'
export interface Filters {
  category: string
  tag: string
  status: string
}

function GearThumbnail({ item }: { item: GearItem }) {
  const [failed, setFailed] = useState(false)
  const unavailable = !item.photoUrl || failed
  return (
    <span
      className={`gear-thumb ${unavailable ? 'is-unavailable' : ''}`}
      style={{ '--accent': item.color } as React.CSSProperties}
      title={unavailable ? 'Image unavailable' : undefined}
    >
      {!unavailable ? (
        <img src={item.photoUrl} alt="" onError={() => setFailed(true)} />
      ) : (
        <span className="image-fallback" aria-label="Image unavailable">
          <ImageOff size={15} aria-hidden="true" />
          <small>No image</small>
        </span>
      )}
    </span>
  )
}
interface Props {
  items: GearItem[]
  totalItems: number
  selectedId: string
  query: string
  onQueryChange: (query: string) => void
  onSelect: (id: string) => void
  onAddToLoadout: (id: string) => void
  registerAddButton: (id: string, element: HTMLButtonElement | null) => void
  onAdd: () => void
  onEdit: (item: GearItem) => void
  onDuplicate: (item: GearItem) => void
  onDelete: (item: GearItem) => void
  packedItemIds: Set<string>
  categoryLabels: Record<string, string>
  categories: GearCategory[]
  displayWeightUnit: DisplayWeightUnit
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  sort: SortOption
  onSortChange: (sort: SortOption) => void
}

export function GearVault(props: Props) {
  const {
    items,
    totalItems,
    selectedId,
    query,
    onQueryChange,
    onSelect,
    onAddToLoadout,
    registerAddButton,
    onAdd,
    onEdit,
    onDuplicate,
    onDelete,
    packedItemIds,
    categoryLabels,
    categories,
    displayWeightUnit,
    filters,
    onFiltersChange,
    sort,
    onSortChange,
  } = props
  const tags = [...new Set(items.flatMap((item) => item.tags ?? []))].sort()
  return (
    <section className="panel vault" aria-labelledby="vault-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 id="vault-title">Gear Vault</h1>
        </div>
        <button className="add-item" onClick={onAdd}>
          <Plus size={16} /> Add item
        </button>
      </div>
      <div className="search-row">
        <label className="search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search gear</span>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search your gear..."
          />
        </label>
      </div>
      <div className="filter-grid" aria-label="Inventory filters">
        <label>
          <span>Category</span>
          <select
            value={filters.category}
            onChange={(e) =>
              onFiltersChange({ ...filters, category: e.target.value })
            }
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Tag</span>
          <select
            value={filters.tag}
            onChange={(e) =>
              onFiltersChange({ ...filters, tag: e.target.value })
            }
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag}>{tag}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Loadout</span>
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value })
            }
          >
            <option value="">Any status</option>
            <option value="packed">In loadout</option>
            <option value="unpacked">Not in loadout</option>
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <option value="name">Name</option>
            <option value="weight">Weight</option>
            <option value="category">Category</option>
            <option value="modified">Recently modified</option>
          </select>
        </label>
      </div>
      <p className="result-count">
        {items.length} of {totalItems} items
      </p>
      <div className="gear-grid">
        {items.map((item) => (
          <article
            className={`gear-card ${selectedId === item.id ? 'is-selected' : ''}`}
            key={item.id}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('text/gear-id', item.id)
              event.dataTransfer.effectAllowed = 'copy'
            }}
          >
            <button
              className="gear-card__main"
              onClick={() => onSelect(item.id)}
              aria-label={`Inspect ${item.name}`}
            >
              <GearThumbnail item={item} />
              <span className="gear-card__copy">
                <strong>{item.name}</strong>
                <span>
                  {categoryLabels[item.categoryId] ?? 'Uncategorized'}
                </span>
                <b>
                  {formatWeight(
                    item.weightGrams,
                    item.displayWeightUnit ?? displayWeightUnit,
                  )}
                </b>
              </span>
            </button>
            <button
              className={`pack-action ${packedItemIds.has(item.id) ? 'is-packed' : ''}`}
              ref={(element) => registerAddButton(item.id, element)}
              onClick={() => onAddToLoadout(item.id)}
              aria-label={`Add ${item.name} to active loadout${packedItemIds.has(item.id) ? '; increments quantity' : ''}`}
            >
              <span>
                {packedItemIds.has(item.id) ? (
                  <Check size={14} />
                ) : (
                  <Plus size={14} />
                )}
              </span>
              {packedItemIds.has(item.id) ? 'Add another' : 'Add to loadout'}
            </button>
            <div
              className="card-actions"
              aria-label={`Actions for ${item.name}`}
            >
              <button
                onClick={() => onEdit(item)}
                aria-label={`Edit ${item.name}`}
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => onDuplicate(item)}
                aria-label={`Duplicate ${item.name}`}
              >
                <Copy size={14} />
              </button>
              <button
                onClick={() => onDelete(item)}
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}
        {!items.length && totalItems === 0 && (
          <div className="empty-state">
            <span>＋</span>
            <h3>Your vault is ready</h3>
            <p>Add your first piece of gear to start building loadouts.</p>
            <button className="button-primary" onClick={onAdd}>
              Add your first item
            </button>
          </div>
        )}
        {!items.length && totalItems > 0 && (
          <div className="empty-state">
            <Search />
            <h3>No matching gear</h3>
            <p>Try changing your search or filters.</p>
            <button
              className="button-secondary"
              onClick={() => {
                onQueryChange('')
                onFiltersChange({ category: '', tag: '', status: '' })
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
