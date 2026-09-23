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

  const loadoutTab = page.getByRole('tab', { name: 'Loadout' })
  const vaultTab = page.getByRole('tab', { name: 'Vault' })
  if (await loadoutTab.isVisible()) await loadoutTab.click()
  page.once('dialog', (prompt) => prompt.accept('Capacity test'))
  await page.getByRole('button', { name: 'New' }).click()
  if (await vaultTab.isVisible()) await vaultTab.click()
  await page
    .getByRole('button', { name: 'Add Anvil to active loadout' })
    .click()
  if (await loadoutTab.isVisible()) await loadoutTab.click()
  await expect(page.getByText('Over capacity')).toBeVisible()
  await page
    .getByRole('button', { name: 'Remove Anvil from Capacity test' })
    .click()
  await expect(page.getByTestId('capacity-status')).toContainText('available')
  await page.getByRole('button', { name: 'Undo' }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Export/ }).click()
  const stream = await (await downloadPromise).createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))

  await page.evaluate(() =>
    localStorage.setItem(
      'packdb.inventory',
      JSON.stringify({
        schemaVersion: 2,
        gearItems: [],
        categories: [],
        loadouts: [],
        userSettings: {
          displayWeightUnit: 'kg',
          carryCapacityGrams: 3200,
        },
      }),
    ),
  )
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
