import { expect, test } from '@playwright/test'

test('keyboard operation, modal focus, names, announcements, and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('heading', { name: 'Gear Vault' }).waitFor()
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe('auto')

  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toBeVisible()
  await page.getByRole('button', { name: 'Add item' }).focus()
  await page.keyboard.press('Enter')
  const modal = page.getByRole('dialog', { name: 'Add an item' })
  await expect(modal.getByLabel(/Name/)).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(
    modal.getByRole('button', { name: 'Add to vault' }),
  ).toBeFocused()
  await page.keyboard.press('Escape')

  const add = page.getByRole('button', {
    name: 'Add Tensor All-Season to active loadout',
  })
  await expect(add).toHaveAccessibleName(/Add Tensor All-Season/)
  await add.click()
  await expect(page.locator('[aria-live="polite"]')).toContainText(
    'Tensor All-Season added',
  )
})

test('each supported viewport avoids horizontal overflow', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('heading', { name: 'Gear Vault' }).waitFor()
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true)
  await expect(page.getByRole('button', { name: 'Add item' })).toBeVisible()
})

test('external links use safe protocols and opener isolation', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'packdb.inventory',
      JSON.stringify({
        schemaVersion: 2,
        categories: [{ id: 'tools', label: 'Tools' }],
        userSettings: { displayWeightUnit: 'kg', carryCapacityGrams: 5000 },
        loadouts: [{ id: 'trip', name: 'Trip', entries: [] }],
        gearItems: [
          {
            id: 'safe',
            name: 'Safe item',
            brand: '',
            weightGrams: 1,
            weightUnit: 'g',
            categoryId: 'tools',
            color: '#000',
            productUrl: 'https://example.com/gear',
          },
        ],
      }),
    )
  })
  await page.goto('/')
  const link = page.getByRole('link', { name: 'View product website' })
  await expect(link).toHaveAttribute('href', /^https:/)
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
})
