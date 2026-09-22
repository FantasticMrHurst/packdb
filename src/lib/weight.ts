export const formatWeight = (grams: number) => {
  if (grams < 1000) return `${grams} g`
  return `${(grams / 1000).toFixed(2)} kg`
}
