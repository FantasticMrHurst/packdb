import { useEffect, useId, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { toGrams } from '../../lib/weight'
import type {
  DisplayWeightUnit,
  GearCategory,
  GearItem,
} from '../../types/gear'

interface Props {
  open: boolean
  item?: GearItem
  categories: GearCategory[]
  onClose: () => void
  onSave: (item: GearItem) => void
}

type Errors = Partial<
  Record<'name' | 'weight' | 'category' | 'photo' | 'productUrl', string>
>
const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const validHttpUrl = (value: string) => {
  if (!value) return true
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

export function ItemDialog({ open, item, categories, onClose, onSave }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState<DisplayWeightUnit>('g')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && dialog && !dialog.open) dialog.showModal()
    if (!open && dialog?.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const preferred = item?.displayWeightUnit ?? 'g'
    const divisors = { g: 1, kg: 1000, oz: 28.349523125, lb: 453.59237 }
    /* The dialog keeps a draft that must be reset whenever a different item opens. */
    /* eslint-disable react-hooks/set-state-in-effect */
    setName(item?.name ?? '')
    setPhotoUrl(item?.photoUrl ?? '')
    setProductUrl(item?.productUrl ?? '')
    setWeight(
      item
        ? String(Number((item.weightGrams / divisors[preferred]).toFixed(3)))
        : '',
    )
    setUnit(preferred)
    setCategoryId(item?.categoryId ?? categories[0]?.id ?? '')
    setTags(item?.tags?.join(', ') ?? '')
    setNotes(item?.notes ?? '')
    setErrors({})
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, item, categories])

  const choosePhoto = (file?: File) => {
    if (!file) return
    if (!imageTypes.includes(file.type)) {
      setErrors((current) => ({
        ...current,
        photo: 'Choose a JPG, PNG, WebP, or GIF image.',
      }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(String(reader.result))
      setErrors((current) => ({ ...current, photo: undefined }))
    }
    reader.readAsDataURL(file)
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const numberWeight = Number(weight)
    const nextErrors: Errors = {}
    if (!name.trim()) nextErrors.name = 'Name is required.'
    if (!weight || !Number.isFinite(numberWeight) || numberWeight <= 0)
      nextErrors.weight = 'Enter a weight greater than zero.'
    if (!categoryId) nextErrors.category = 'Choose a category.'
    if (
      photoUrl &&
      !photoUrl.startsWith('data:image/') &&
      !validHttpUrl(photoUrl)
    )
      nextErrors.photo = 'Enter a valid HTTP or HTTPS image URL.'
    if (!validHttpUrl(productUrl))
      nextErrors.productUrl = 'Enter a valid HTTP or HTTPS product link.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSave({
      id:
        item?.id ??
        `gear-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      brand: item?.brand ?? '',
      photoUrl: photoUrl || undefined,
      productUrl: productUrl || undefined,
      weightGrams: toGrams(numberWeight, unit),
      weightUnit: 'g',
      displayWeightUnit: unit,
      categoryId,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      notes: notes.trim() || undefined,
      description: item?.description,
      color: item?.color ?? '#729868',
      modifiedAt: new Date().toISOString(),
    })
  }

  const error = (key: keyof Errors) =>
    errors[key] ? (
      <span className="field-error" id={`${key}-error`}>
        {errors[key]}
      </span>
    ) : null
  return (
    <dialog
      ref={dialogRef}
      className="item-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate>
        <header>
          <div>
            <p className="eyebrow">Gear details</p>
            <h2 id={titleId}>{item ? 'Edit item' : 'Add an item'}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </header>
        <div className="dialog-fields">
          <label className="field field--wide">
            <span>
              Name <b aria-hidden="true">*</b>
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {error('name')}
          </label>
          <fieldset className="field field--wide photo-field">
            <legend>Photo</legend>
            <label className="file-button">
              <ImagePlus size={16} /> Choose photo
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => choosePhoto(e.target.files?.[0])}
              />
            </label>
            <span>or</span>
            <label>
              <span className="sr-only">Photo URL</span>
              <input
                placeholder="https://…"
                value={photoUrl.startsWith('data:') ? '' : photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                aria-invalid={!!errors.photo}
              />
            </label>
            {error('photo')}
          </fieldset>
          <label className="field field--wide">
            <span>Product link</span>
            <input
              type="url"
              placeholder="https://…"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              aria-invalid={!!errors.productUrl}
              aria-describedby={
                errors.productUrl ? 'productUrl-error' : undefined
              }
            />
            {error('productUrl')}
          </label>
          <label className="field">
            <span>
              Weight <b aria-hidden="true">*</b>
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              aria-invalid={!!errors.weight}
              aria-describedby={errors.weight ? 'weight-error' : undefined}
            />
            {error('weight')}
          </label>
          <label className="field">
            <span>Unit</span>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as DisplayWeightUnit)}
            >
              <option>g</option>
              <option>kg</option>
              <option>oz</option>
              <option>lb</option>
            </select>
          </label>
          <label className="field field--wide">
            <span>
              Category <b aria-hidden="true">*</b>
            </span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              aria-invalid={!!errors.category}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            {error('category')}
          </label>
          <label className="field field--wide">
            <span>
              Tags <small>comma separated</small>
            </span>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ultralight, summer"
            />
          </label>
          <label className="field field--wide">
            <span>Notes</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        <footer className="dialog-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button-primary" type="submit">
            {item ? 'Save changes' : 'Add to vault'}
          </button>
        </footer>
      </form>
    </dialog>
  )
}
