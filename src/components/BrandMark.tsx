import { Mountain } from 'lucide-react'

export function BrandMark() {
  return (
    <a className="brand" href="#top" aria-label="PackDB home">
      <span className="brand__icon">
        <Mountain aria-hidden="true" size={21} />
      </span>
      <span>
        PACK<span>DB</span>
      </span>
    </a>
  )
}
