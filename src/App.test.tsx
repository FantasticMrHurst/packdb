import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

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
        name: 'Remove Copper Spur HV UL2 from trip',
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
})
