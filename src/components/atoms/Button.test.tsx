import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('uses an accessible button element and forwards its state', () => {
    render(<Button disabled>Start focus</Button>)

    expect(screen.getByRole('button', { name: 'Start focus' })).toBeDisabled()
  })
})
