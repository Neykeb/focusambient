import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../model/clerkConfig', () => ({ isClerkConfigured: false }))
import { router } from '../../../app/router/router'

describe('AuthControls', () => {
  beforeEach(async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    router.update({ history })
    await router.load()
  })

  it('keeps the sign-in entry visible when Clerk is not configured', () => {
    render(<RouterProvider router={router} />)

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in',
    )
  })
})
