import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('local-first happy path can be exported and restored', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Add item' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add an item' })
  await dialog.getByLabel(/Name/).fill('Anvil')
  await dialog.getByLabel(/Weight/).fill('4')
  await dialog.getByLabel('Unit').selectOption('kg')
  await dialog.getByRole('button', { name: 'Add to vault' }).click()

  page.once('dialog', (prompt) => prompt.accept('Capacity test'))
  await page.getByRole('button', { name: 'New' }).click()
  await page
    .getByRole('button', { name: 'Add Anvil to active loadout' })
    .click()
  await page.getByRole('tab', { name: 'Loadout' }).click()
  await expect(page.getByText('Over capacity')).toBeVisible()
  await page.getByRole('button', { name: 'Remove Anvil from trip' }).click()
  await expect(page.getByText(/available/)).toBeVisible()
  await page.getByRole('button', { name: 'Undo' }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Export/ }).click()
  const stream = await (await downloadPromise).createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))

  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByLabel(/Import/).setInputFiles({
    name: 'packdb-inventory.json',
    mimeType: 'application/json',
    buffer: Buffer.concat(chunks),
  })
  await expect(page.getByText(/Import complete/)).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Inspect Anvil' }),
  ).toBeVisible()
})
