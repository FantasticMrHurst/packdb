import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { MAX_IMPORT_BYTES, STORAGE_KEY } from './lib/storage/inventoryStorage'
import { seedInventory } from './features/inventory/seedItems'

describe('PackDB shell', () => {
  beforeEach(() => localStorage.clear())
  it('renders the three primary workspace regions', async () => {
    render(<App />)
    expect(
      await screen.findByRole('heading', { name: 'Gear Vault' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Olympic Traverse' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Inspector' }),
    ).toBeInTheDocument()
  })

  it('filters the seeded inventory', async () => {
    render(<App />)
    await userEvent.type(
      await screen.findByPlaceholderText('Search your gear...'),
      'Sawyer',
    )
    expect(
      screen.getByRole('button', { name: 'Inspect Squeeze Filter' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Inspect Copper Spur HV UL2' }),
    ).not.toBeInTheDocument()
  })

  it('creates, edits, and category-filters gear', async () => {
    render(<App />)
    await userEvent.click(
      await screen.findByRole('button', { name: /Add item/ }),
    )
    const addDialog = screen.getByRole('dialog', { name: 'Add an item' })
    await userEvent.type(
      within(addDialog).getByLabelText(/Name/),
      'Titanium mug',
    )
    await userEvent.type(within(addDialog).getByLabelText(/Weight/), '90')
    await userEvent.selectOptions(
      within(addDialog).getByLabelText(/Category/),
      'cooking',
    )
    await userEvent.click(
      within(addDialog).getByRole('button', { name: 'Add to vault' }),
    )
    expect(
      screen.getByRole('button', { name: 'Inspect Titanium mug' }),
    ).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Edit Titanium mug' }),
    )
    const editDialog = screen.getByRole('dialog', { name: 'Edit item' })
    const name = within(editDialog).getByLabelText(/Name/)
    await userEvent.clear(name)
    await userEvent.type(name, 'Camp mug')
    await userEvent.click(
      within(editDialog).getByRole('button', { name: 'Save changes' }),
    )
    expect(
      screen.getByRole('button', { name: 'Inspect Camp mug' }),
    ).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'water')
    expect(
      screen.getByRole('button', { name: 'Inspect Squeeze Filter' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Inspect Camp mug' }),
    ).not.toBeInTheDocument()
  })

  it('increments an existing loadout entry instead of duplicating it', async () => {
    render(<App />)
    const addAnother = await screen.findByRole('button', {
      name: /Add Copper Spur HV UL2 to active loadout; increments quantity/,
    })
    await userEvent.click(addAnother)
    expect(
      screen.getByLabelText('Quantity for Copper Spur HV UL2'),
    ).toHaveValue(2)
  })

  it('removes a loadout entry and supports undo', async () => {
    render(<App />)
    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Remove Copper Spur HV UL2 from Olympic Traverse',
      }),
    )
    expect(
      screen.queryByLabelText('Quantity for Copper Spur HV UL2'),
    ).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Undo/ }))
    expect(
      screen.getByLabelText('Quantity for Copper Spur HV UL2'),
    ).toBeInTheDocument()
  })

  it('assigns gear, changes quantity, and announces each operation', async () => {
    render(<App />)
    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Add Tensor All-Season to active loadout',
      }),
    )
    expect(screen.getByLabelText('Quantity for Tensor All-Season')).toHaveValue(
      1,
    )
    expect(
      screen.getByText('Tensor All-Season added to Olympic Traverse.'),
    ).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Quantity for Tensor All-Season'), {
      target: { value: '3' },
    })
    expect(screen.getByLabelText('Quantity for Tensor All-Season')).toHaveValue(
      3,
    )
    expect(screen.getByText('Loadout entry updated.')).toBeInTheDocument()
  })

  it('reloads persisted changes and reports storage quota failures', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const first = render(<App />)
    await userEvent.click(
      await screen.findByRole('button', { name: /Add Tensor All-Season/ }),
    )
    await act(() => vi.advanceTimersByTimeAsync(500))
    await screen.findByText('Saved')
    first.unmount()
    render(<App />)
    expect(
      await screen.findByLabelText('Quantity for Tensor All-Season'),
    ).toHaveValue(1)

    setItem.mockImplementationOnce(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    await userEvent.click(
      screen.getByRole('button', { name: /Add Tensor All-Season/ }),
    )
    await act(() => vi.advanceTimersByTimeAsync(500))
    expect(await screen.findByText('Save error')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('imports valid JSON, rejects malformed and oversized files, and exports JSON', async () => {
    const createObjectURL = vi.fn(() => 'blob:packdb')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL, revokeObjectURL }),
    )
    render(<App />)
    await screen.findByRole('heading', { name: 'Gear Vault' })
    await userEvent.click(screen.getByRole('button', { name: /Export/ }))
    expect(createObjectURL).toHaveBeenCalledOnce()

    const input = screen.getByLabelText('Import', { selector: 'input' })
    fireEvent.change(input, {
      target: {
        files: [new File(['{oops'], 'bad.json', { type: 'application/json' })],
      },
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(/malformed/)
    fireEvent.change(input, {
      target: {
        files: [
          new File([new Uint8Array(MAX_IMPORT_BYTES + 1)], 'large.json', {
            type: 'application/json',
          }),
        ],
      },
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(/2 MB/)

    const restored = {
      ...seedInventory,
      gearItems: [
        {
          ...seedInventory.gearItems[0],
          id: 'restored',
          name: 'Restored gear',
        },
      ],
    }
    await userEvent.selectOptions(
      screen.getByLabelText('Import behavior'),
      'overwrite',
    )
    fireEvent.change(input, {
      target: {
        files: [
          new File([JSON.stringify(restored)], 'valid.json', {
            type: 'application/json',
          }),
        ],
      },
    })
    expect(await screen.findByText(/Import complete/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Inspect Restored gear' }),
    ).toBeInTheDocument()
    vi.unstubAllGlobals()
  })

  it('transitions into and out of the over-capacity state', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...seedInventory,
        userSettings: {
          ...seedInventory.userSettings,
          carryCapacityGrams: 100,
        },
      }),
    )
    render(<App />)
    expect(await screen.findByText('Over capacity')).toBeInTheDocument()
    for (const button of screen.getAllByRole('button', {
      name: /Remove .* from Olympic Traverse/,
    }))
      await userEvent.click(button)
    expect(screen.getByText(/kg available/)).toBeInTheDocument()
  })
})
