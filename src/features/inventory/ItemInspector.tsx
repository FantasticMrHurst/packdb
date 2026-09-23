import { Box, Ruler, Tag } from 'lucide-react'
import type { DisplayWeightUnit, GearItem } from '../../types/gear'
import { formatWeight } from '../../lib/weight'

interface Props {
  item: GearItem
  categoryLabel: string
  displayWeightUnit: DisplayWeightUnit
  isInLoadout: boolean
}

export function ItemInspector({
  item,
  categoryLabel,
  displayWeightUnit,
  isInLoadout,
}: Props) {
  return (
    <aside className="panel inspector" aria-labelledby="inspector-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Selected item</p>
          <h2 id="inspector-title">Inspector</h2>
        </div>
      </div>
      <div
        className="product-visual"
        style={{ '--accent': item.color } as React.CSSProperties}
      >
        <span>{item.name.charAt(0)}</span>
        <div className="visual-grid" />
      </div>
      <p className="category">
        <Tag size={13} /> {categoryLabel}
      </p>
      <h3>{item.name}</h3>
      <p className="maker">{item.brand}</p>
      <p className="description">{item.description}</p>
      {item.productUrl && (
        <a href={item.productUrl} target="_blank" rel="noopener noreferrer">
          View product website
        </a>
      )}
      <dl className="specs">
        <div>
          <dt>
            <Ruler size={15} /> Weight
          </dt>
          <dd>{formatWeight(item.weightGrams, displayWeightUnit)}</dd>
        </div>
        <div>
          <dt>
            <Box size={15} /> Status
          </dt>
          <dd>{isInLoadout ? 'In Loadout' : 'In Vault'}</dd>
        </div>
      </dl>
      <button className="secondary-action">Edit item details</button>
    </aside>
  )
}
