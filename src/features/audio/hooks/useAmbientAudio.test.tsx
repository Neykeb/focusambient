import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AmbientAudioEngine } from '../lib/AmbientAudioEngine'
import {
  AUDIO_PREFERENCES_STORAGE_KEY,
  useAmbientAudio,
} from './useAmbientAudio'

function createFakeEngine(): AmbientAudioEngine {
  return {
    play: vi.fn(async () => undefined),
    pause: vi.fn(async () => undefined),
    setVolume: vi.fn(),
    dispose: vi.fn(async () => undefined),
  }
}

describe('useAmbientAudio', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts, pauses, and switches a soundscape', async () => {
    const engine = createFakeEngine()
    const { result } = renderHook(() => useAmbientAudio(() => engine))

    await act(() => result.current.togglePlayback())
    expect(result.current.isPlaying).toBe(true)
    expect(engine.play).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'rain' }),
      0.38,
    )

    await act(() => result.current.selectSoundscape('forest'))
    expect(result.current.soundscapeId).toBe('forest')
    expect(engine.play).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'forest' }),
      0.38,
    )

    await act(() => result.current.togglePlayback())
    expect(result.current.isPlaying).toBe(false)
    expect(engine.pause).toHaveBeenCalledOnce()
  })

  it('persists validated preferences', async () => {
    const engine = createFakeEngine()
    const { result } = renderHook(() => useAmbientAudio(() => engine))

    act(() => {
      result.current.setVolume(0.72)
    })
    await act(() => result.current.selectSoundscape('cafe'))

    await waitFor(() => {
      expect(
        window.localStorage.getItem(AUDIO_PREFERENCES_STORAGE_KEY),
      ).toContain('cafe')
    })

    expect(
      JSON.parse(
        window.localStorage.getItem(AUDIO_PREFERENCES_STORAGE_KEY) ?? '{}',
      ),
    ).toEqual({ soundscapeId: 'cafe', volume: 0.72 })
  })

  it('falls back when stored preferences are invalid', () => {
    window.localStorage.setItem(
      AUDIO_PREFERENCES_STORAGE_KEY,
      JSON.stringify({ soundscapeId: 'ocean', volume: 4 }),
    )

    const { result } = renderHook(() =>
      useAmbientAudio(() => createFakeEngine()),
    )

    expect(result.current.soundscapeId).toBe('rain')
    expect(result.current.volume).toBe(0.38)
  })

  it('exposes an understandable playback error', async () => {
    const engine = createFakeEngine()
    engine.play = vi.fn(async () => {
      throw new Error('blocked')
    })
    const { result } = renderHook(() => useAmbientAudio(() => engine))

    await act(() => result.current.togglePlayback())

    expect(result.current.isPlaying).toBe(false)
    expect(result.current.error).toContain('Audio could not start')
  })
})
