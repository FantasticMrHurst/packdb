import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('PackDB shell', () => {
  it('renders the three primary workspace regions', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'Gear Vault' }),
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
      screen.getByPlaceholderText('Search your gear...'),
      'Sawyer',
    )
    expect(screen.getByText('Squeeze Filter')).toBeInTheDocument()
    expect(screen.queryByText('Copper Spur HV UL2')).not.toBeInTheDocument()
  })
})
