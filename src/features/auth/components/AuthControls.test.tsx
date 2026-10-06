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

    const signInLinks = screen.getAllByRole("link", { name: "Sign in" });

    expect(signInLinks).toHaveLength(2);
    expect(signInLinks[0]).toHaveAttribute("href", "/sign-in");
    expect(signInLinks[1]).toHaveAttribute("href", "/sign-in");
  })
})
