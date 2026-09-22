import type { DisplayWeightUnit } from '../types/gear'

const GRAMS_PER_OUNCE = 28.349523125
const GRAMS_PER_POUND = 453.59237

/** Convert a user-entered weight to the canonical integer gram representation. */
export const toGrams = (weight: number, unit: DisplayWeightUnit) => {
  const factors: Record<DisplayWeightUnit, number> = {
    g: 1,
    kg: 1000,
    oz: GRAMS_PER_OUNCE,
    lb: GRAMS_PER_POUND,
  }
  return Math.round(weight * factors[unit])
}

/** Format canonical integer grams without changing the stored value. */
export const formatWeight = (
  grams: number,
  displayUnit?: DisplayWeightUnit,
) => {
  const unit = displayUnit ?? (grams < 1000 ? 'g' : 'kg')

  switch (unit) {
    case 'g':
      return `${Math.round(grams)} g`
    case 'kg':
      return `${(grams / 1000).toFixed(2)} kg`
    case 'oz':
      return `${(grams / GRAMS_PER_OUNCE).toFixed(1)} oz`
    case 'lb':
      return `${(grams / GRAMS_PER_POUND).toFixed(2)} lb`
  }
}
