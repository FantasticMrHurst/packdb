import { CheckCircle2, MoreHorizontal, TentTree, X } from 'lucide-react'
import type { DisplayWeightUnit, GearItem, Loadout } from '../../types/gear'
import { formatWeight } from '../../lib/weight'

interface Props {
  itemsById: Map<string, GearItem>
  loadout: Loadout
  capacity: number
  categoryLabels: Record<string, string>
  displayWeightUnit: DisplayWeightUnit
  onRemove: (id: string) => void
}

export function ActiveLoadout({
  itemsById,
  loadout,
  capacity,
  categoryLabels,
  displayWeightUnit,
  onRemove,
}: Props) {
  const entries = loadout.entries.flatMap((entry) => {
    const item = itemsById.get(entry.gearItemId)
    return item ? [{ entry, item }] : []
  })
  const total = entries.reduce(
    (sum, { entry, item }) => sum + item.weightGrams * entry.quantity,
    0,
  )
  const percent = Math.round((total / capacity) * 100)
  const encumbered = total > capacity
  return (
    <section className="panel loadout" aria-labelledby="loadout-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Active Loadout</p>
          <h2 id="loadout-title">{loadout.name}</h2>
        </div>
        <button className="icon-button ghost" aria-label="Loadout options">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="trip-meta">
        <span>
          <TentTree size={15} /> 4 days
        </span>
        <span>Sep 26–29</span>
        <span>Solo</span>
      </div>
      <div className="capacity-card">
        <div className="capacity-row">
          <span>Carry Capacity</span>
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
          <span>{percent}% packed</span>
          <span className={encumbered ? 'status encumbered' : 'status'}>
            <CheckCircle2 size={13} />{' '}
            {encumbered
              ? 'Encumbered'
              : `${formatWeight(capacity - total, displayWeightUnit)} available`}
          </span>
        </div>
      </div>
      <div className="loadout-label">
        <span>Packed gear</span>
        <span>{entries.length} items</span>
      </div>
      <ul className="packed-list">
        {entries.map(({ entry, item }) => (
          <li key={entry.id}>
            <span className="item-dot" style={{ background: item.color }} />
            <span>
              <strong>{item.name}</strong>
              <small>{categoryLabels[item.categoryId]}</small>
            </span>
            <b>
              {formatWeight(
                item.weightGrams * entry.quantity,
                displayWeightUnit,
              )}
            </b>
            <button
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.name}`}
            >
              <X size={15} />
            </button>
          </li>
        ))}
      </ul>
      <button className="primary-action">
        <PlusIcon /> Add gear to Loadout
      </button>
    </section>
  )
}

function PlusIcon() {
  return <span aria-hidden="true">＋</span>
}
