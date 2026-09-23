import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ItemDialog, MAX_IMAGE_BYTES } from './ItemDialog'

const categories = [{ id: 'tools', label: 'Tools' }]

describe('ItemDialog', () => {
  it('creates an item with an accessible form', async () => {
    const onSave = vi.fn()
    render(
      <ItemDialog
        open
        categories={categories}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    )
    const dialog = screen.getByRole('dialog', { name: 'Add an item' })
    await userEvent.type(within(dialog).getByLabelText(/Name/), 'Trail mug')
    await userEvent.type(within(dialog).getByLabelText(/Weight/), '92')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Add to vault' }),
    )
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Trail mug', weightGrams: 92 }),
    )
  })

  it('rejects unsafe links, unsupported images, and oversized images', async () => {
    render(
      <ItemDialog
        open
        categories={categories}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    )
    await userEvent.type(screen.getByLabelText(/Name/), 'Mug')
    await userEvent.type(screen.getByLabelText(/Weight/), '92')
    await userEvent.type(
      screen.getByLabelText('Product link'),
      'javascript:alert(1)',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add to vault' }))
    expect(
      screen.getByText('Enter a valid HTTP or HTTPS product link.'),
    ).toBeInTheDocument()

    const picker = screen.getByLabelText('Choose photo')
    fireEvent.change(picker, {
      target: {
        files: [new File(['text'], 'gear.svg', { type: 'image/svg+xml' })],
      },
    })
    expect(screen.getByText(/JPG, PNG, WebP, or GIF/)).toBeInTheDocument()
    fireEvent.change(picker, {
      target: {
        files: [
          new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'huge.png', {
            type: 'image/png',
          }),
        ],
      },
    })
    expect(screen.getByText(/smaller than 1 MB/)).toBeInTheDocument()
  })
})
