import type { Soundscape } from '../model/soundscapes'

export interface AmbientAudioEngine {
  play: (soundscape: Soundscape, volume: number) => Promise<void>
  pause: () => Promise<void>
  setVolume: (volume: number) => void
  dispose: () => Promise<void>
}

export class WebAmbientAudioEngine implements AmbientAudioEngine {
  private mediaElement: HTMLAudioElement | null = null

  async play(soundscape: Soundscape, volume: number) {
    this.stopMedia()

    const mediaElement = new Audio(soundscape.audioUrl)
    mediaElement.loop = true
    mediaElement.preload = 'auto'
    mediaElement.volume = this.normalizeVolume(volume)
    this.mediaElement = mediaElement

    try {
      await mediaElement.play()
    } catch (error) {
      this.stopMedia()
      throw error
    }
  }

  async pause() {
    this.stopMedia()
  }

  setVolume(volume: number) {
    if (this.mediaElement) {
      this.mediaElement.volume = this.normalizeVolume(volume)
    }
  }

  async dispose() {
    this.stopMedia()
  }

  private normalizeVolume(volume: number) {
    return Math.min(1, Math.max(0, volume))
  }

  private stopMedia() {
    if (!this.mediaElement) return
    this.mediaElement.pause()
    this.mediaElement.removeAttribute('src')
    this.mediaElement.load()
    this.mediaElement = null
  }
}

export function createAmbientAudioEngine(): AmbientAudioEngine {
  return new WebAmbientAudioEngine()
}
