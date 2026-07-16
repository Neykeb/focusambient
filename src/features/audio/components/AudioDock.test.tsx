import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AmbientAudioEngine } from '../lib/AmbientAudioEngine'
import { AudioDock } from './AudioDock'

function engineFactory(): AmbientAudioEngine {
  return {
    play: vi.fn(async () => undefined),
    pause: vi.fn(async () => undefined),
    setVolume: vi.fn(),
    dispose: vi.fn(async () => undefined),
  }
}

describe('AudioDock', () => {
  it('plays audio and exposes soundscape settings', async () => {
    const user = userEvent.setup()
    render(<AudioDock engineFactory={engineFactory} />)

    await user.click(
      screen.getByRole('button', { name: 'Play ambient sound' }),
    )
    expect(
      screen.getByRole('button', { name: 'Pause ambient sound' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Open audio settings' }),
    )
    expect(
      screen.getByRole('button', { name: 'Quiet forest' }),
    ).toBeInTheDocument()
  })
})
