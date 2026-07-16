import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CustomTimerDialog } from './CustomTimerDialog'

describe('CustomTimerDialog', () => {
  it('validates and submits a custom timer', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()

    render(<CustomTimerDialog onClose={vi.fn()} onCreate={onCreate} />)

    await user.type(screen.getByLabelText('Timer name'), 'Writing')
    await user.clear(screen.getByLabelText('Duration in minutes'))
    await user.type(screen.getByLabelText('Duration in minutes'), '40')
    await user.click(screen.getByRole('button', { name: 'Save timer' }))

    expect(onCreate).toHaveBeenCalledWith({
      name: 'Writing',
      durationMinutes: 40,
    })
  })

  it('shows a validation error for an invalid duration', async () => {
    const user = userEvent.setup()

    render(<CustomTimerDialog onClose={vi.fn()} onCreate={vi.fn()} />)

    await user.type(screen.getByLabelText('Timer name'), 'Writing')
    await user.clear(screen.getByLabelText('Duration in minutes'))
    await user.type(screen.getByLabelText('Duration in minutes'), '0')
    await user.click(screen.getByRole('button', { name: 'Save timer' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Choose at least 1 minute.')
  })
})
