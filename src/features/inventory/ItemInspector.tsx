import { Box, Ruler, Tag } from 'lucide-react'
import type { GearItem } from '../../types/gear'
import { formatWeight } from '../../lib/weight'

export function ItemInspector({ item }: { item: GearItem }) {
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
        <Tag size={13} /> {item.category}
      </p>
      <h3>{item.name}</h3>
      <p className="maker">{item.brand}</p>
      <p className="description">{item.description}</p>
      <dl className="specs">
        <div>
          <dt>
            <Ruler size={15} /> Weight
          </dt>
          <dd>{formatWeight(item.weightGrams)}</dd>
        </div>
        <div>
          <dt>
            <Box size={15} /> Status
          </dt>
          <dd>{item.packed ? 'In Loadout' : 'In Vault'}</dd>
        </div>
      </dl>
      <button className="secondary-action">Edit item details</button>
    </aside>
  )
}
