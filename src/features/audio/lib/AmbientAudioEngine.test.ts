import { Music2 } from 'lucide-react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Soundscape } from '../model/soundscapes'
import { WebAmbientAudioEngine } from './AmbientAudioEngine'

class FakeAudio {
  static instances: FakeAudio[] = []
  src: string
  loop = false
  preload = ''
  volume = 1
  play = vi.fn(async () => undefined)
  pause = vi.fn()
  load = vi.fn()
  removeAttribute = vi.fn()

  constructor(src: string) {
    this.src = src
    FakeAudio.instances.push(this)
  }
}

const externalSoundscape: Soundscape = {
  id: 'ocean-waves',
  label: 'Ocean waves',
  description: 'Calming shoreline',
  source: 'file',
  audioUrl: '/audio/ocean-waves.mp3',
  icon: Music2,
}

describe('WebAmbientAudioEngine external files', () => {
  afterEach(() => {
    FakeAudio.instances = []
    vi.unstubAllGlobals()
  })

  it('loads, loops, controls, and releases an external audio file', async () => {
    vi.stubGlobal('Audio', FakeAudio)
    const engine = new WebAmbientAudioEngine()

    await engine.play(externalSoundscape, 0.42)
    const media = FakeAudio.instances[0]

    expect(media.src).toBe('/audio/ocean-waves.mp3')
    expect(media.loop).toBe(true)
    expect(media.volume).toBe(0.42)
    expect(media.play).toHaveBeenCalledOnce()

    engine.setVolume(0.7)
    expect(media.volume).toBe(0.7)

    await engine.pause()
    expect(media.pause).toHaveBeenCalledOnce()
    expect(media.removeAttribute).toHaveBeenCalledWith('src')
    expect(media.load).toHaveBeenCalledOnce()
  })
})
