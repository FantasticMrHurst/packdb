import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  Plus,
  RotateCcw,
  TentTree,
  Trash2,
  X,
} from 'lucide-react'
import type {
  CarryClassification,
  DisplayWeightUnit,
  GearItem,
  Loadout,
  LoadoutEntry,
} from '../../types/gear'
import { formatWeight } from '../../lib/weight'

interface Props {
  itemsById: Map<string, GearItem>
  loadouts: Loadout[]
  activeLoadoutId: string
  capacity: number
  categoryLabels: Record<string, string>
  displayWeightUnit: DisplayWeightUnit
  undoLabel?: string
  onSwitch: (id: string) => void
  onCreate: () => void
  onRename: () => void
  onDuplicate: () => void
  onDelete: () => void
  onAddGear: () => void
  onDropItem: (id: string) => void
  onUpdateEntry: (id: string, patch: Partial<LoadoutEntry>) => void
  onRemove: (id: string) => void
  onUndo: () => void
}

export function ActiveLoadout(props: Props) {
  const {
    itemsById,
    loadouts,
    activeLoadoutId,
    capacity,
    categoryLabels,
    displayWeightUnit,
    undoLabel,
    onSwitch,
    onCreate,
    onRename,
    onDuplicate,
    onDelete,
    onAddGear,
    onDropItem,
    onUpdateEntry,
    onRemove,
    onUndo,
  } = props
  const loadout =
    loadouts.find(({ id }) => id === activeLoadoutId) ?? loadouts[0]
  if (!loadout) return null
  const entries = loadout.entries.flatMap((entry) => {
    const item = itemsById.get(entry.gearItemId)
    return item ? [{ entry, item }] : []
  })
  const total = entries.reduce(
    (sum, { entry, item }) => sum + item.weightGrams * entry.quantity,
    0,
  )
  const percent = capacity ? Math.round((total / capacity) * 100) : 0
  const encumbered = total > capacity
  const grouped = entries.reduce<Record<string, typeof entries>>(
    (groups, row) => {
      ;(groups[row.item.categoryId] ??= []).push(row)
      return groups
    },
    {},
  )

  return (
    <section
      className="panel loadout"
      aria-labelledby="loadout-title"
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes('text/gear-id'))
          event.preventDefault()
      }}
      onDrop={(event) => {
        const id = event.dataTransfer.getData('text/gear-id')
        if (id) {
          event.preventDefault()
          onDropItem(id)
        }
      }}
    >
      <div className="section-heading loadout-heading">
        <div>
          <p className="eyebrow">Active Loadout</p>
          <h2 id="loadout-title">{loadout.name}</h2>
        </div>
        <label className="trip-switcher">
          <span className="sr-only">Switch trip</span>
          <select value={loadout.id} onChange={(e) => onSwitch(e.target.value)}>
            {loadouts.map((trip) => (
              <option value={trip.id} key={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="trip-actions" aria-label="Trip actions">
        <button onClick={onCreate}>
          <Plus size={13} /> New
        </button>
        <button onClick={onRename}>Rename</button>
        <button onClick={onDuplicate}>
          <Copy size={13} /> Duplicate
        </button>
        <button onClick={onDelete} disabled={loadouts.length === 1}>
          <Trash2 size={13} /> Delete
        </button>
      </div>
      <div className="trip-meta">
        <span>
          <TentTree size={15} /> Backpacking trip
        </span>
      </div>
      <div className="capacity-card">
        <div className="capacity-row">
          <span>Total weight</span>
          <strong>
            {formatWeight(total, displayWeightUnit)}{' '}
            <small>/ {formatWeight(capacity, displayWeightUnit)}</small>
          </strong>
        </div>
        <div className="meter">
          <span
            className={encumbered ? 'danger' : ''}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <div className="capacity-row caption">
          <span>{percent}% of capacity</span>
          <span
            data-testid="capacity-status"
            className={encumbered ? 'status encumbered' : 'status'}
          >
            {encumbered ? (
              <AlertTriangle size={13} />
            ) : (
              <CheckCircle2 size={13} />
            )}{' '}
            {encumbered
              ? 'Over capacity'
              : `${formatWeight(capacity - total, displayWeightUnit)} available`}
          </span>
        </div>
      </div>
      {undoLabel && (
        <div className="undo-bar">
          <span>{undoLabel}</span>
          <button onClick={onUndo}>
            <RotateCcw size={13} /> Undo
          </button>
        </div>
      )}
      <div className="loadout-label">
        <span>Gear by category</span>
        <span>
          {entries.reduce((n, { entry }) => n + entry.quantity, 0)} items
        </span>
      </div>
      <div className="loadout-groups">
        {Object.entries(grouped).map(([categoryId, rows]) => {
          const subtotal = rows.reduce(
            (sum, { entry, item }) => sum + item.weightGrams * entry.quantity,
            0,
          )
          return (
            <section className="loadout-group" key={categoryId}>
              <h3>
                <span>{categoryLabels[categoryId] ?? 'Uncategorized'}</span>
                <small>{formatWeight(subtotal, displayWeightUnit)}</small>
              </h3>
              <ul className="packed-list">
                {rows.map(({ entry, item }) => (
                  <li
                    key={entry.id}
                    className={`${entry.packed ? 'is-packed' : 'is-unpacked'} is-${entry.carryClassification}`}
                  >
                    <span
                      className="item-dot"
                      style={{ background: item.color }}
                    />
                    <span className="loadout-item-name">
                      <strong>{item.name}</strong>
                      <span className="entry-badges">
                        {entry.carryClassification !== 'carried' && (
                          <small
                            className={`classification-badge ${entry.carryClassification}`}
                          >
                            {entry.carryClassification}
                          </small>
                        )}{' '}
                        {!entry.packed && (
                          <small className="unpacked-badge">unpacked</small>
                        )}
                      </span>
                    </span>
                    <b>
                      {formatWeight(
                        item.weightGrams * entry.quantity,
                        displayWeightUnit,
                      )}
                    </b>
                    <div className="entry-controls">
                      <label>
                        <span className="sr-only">
                          Quantity for {item.name}
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={entry.quantity}
                          onChange={(e) =>
                            onUpdateEntry(entry.id, {
                              quantity: Math.max(
                                1,
                                Number(e.target.value) || 1,
                              ),
                            })
                          }
                        />
                      </label>
                      <label>
                        <span className="sr-only">
                          Carry classification for {item.name}
                        </span>
                        <select
                          value={entry.carryClassification}
                          onChange={(e) =>
                            onUpdateEntry(entry.id, {
                              carryClassification: e.target
                                .value as CarryClassification,
                            })
                          }
                        >
                          <option value="carried">Carried</option>
                          <option value="worn">Worn</option>
                          <option value="consumable">Consumable</option>
                        </select>
                      </label>
                      <label className="packed-check">
                        <input
                          type="checkbox"
                          checked={entry.packed}
                          onChange={(e) =>
                            onUpdateEntry(entry.id, {
                              packed: e.target.checked,
                            })
                          }
                        />{' '}
                        Packed
                      </label>
                      <button
                        onClick={() => onRemove(entry.id)}
                        aria-label={`Remove ${item.name} from ${loadout.name}`}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
        {!entries.length && (
          <div className="loadout-empty">
            <p>This trip is empty.</p>
            <span>Use an Add button or drag gear here from the Vault.</span>
          </div>
        )}
      </div>
      <button className="primary-action" onClick={onAddGear}>
        <Plus size={15} /> Add gear from Vault
      </button>
    </section>
  )
}
