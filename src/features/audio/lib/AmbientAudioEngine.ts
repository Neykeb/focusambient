import type { GeneratedSoundscape, Soundscape } from '../model/soundscapes'

export interface AmbientAudioEngine {
  play: (soundscape: Soundscape, volume: number) => Promise<void>
  pause: () => Promise<void>
  setVolume: (volume: number) => void
  dispose: () => Promise<void>
}

export class WebAmbientAudioEngine implements AmbientAudioEngine {
  private context: AudioContext | null = null
  private gainNode: GainNode | null = null
  private source: AudioBufferSourceNode | null = null
  private mediaElement: HTMLAudioElement | null = null

  private ensureContext() {
    if (!this.context) {
      this.context = new AudioContext()
      this.gainNode = this.context.createGain()
      this.gainNode.connect(this.context.destination)
    }

    return this.context
  }

  private createNoiseBuffer(context: AudioContext, noise: GeneratedSoundscape['noise']) {
    const durationSeconds = 3
    const frameCount = context.sampleRate * durationSeconds
    const buffer = context.createBuffer(1, frameCount, context.sampleRate)
    const data = buffer.getChannelData(0)
    let previous = 0

    for (let index = 0; index < frameCount; index += 1) {
      const white = Math.random() * 2 - 1

      if (noise === 'brown') {
        previous = (previous + 0.018 * white) / 1.018
        data[index] = previous * 2.7
      } else {
        data[index] = white * 0.45
      }
    }

    return buffer
  }

  async play(soundscape: Soundscape, volume: number) {
    this.stopSource()
    this.stopMedia()

    if (soundscape.source === 'file') {
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
      return
    }

    const context = this.ensureContext()
    await context.resume()

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    source.buffer = this.createNoiseBuffer(context, soundscape.noise)
    source.loop = true
    filter.type = soundscape.filterType
    filter.frequency.value = soundscape.filterFrequency
    filter.Q.value = soundscape.id === 'cafe' ? 0.7 : 0.35

    source.connect(filter)
    filter.connect(this.gainNode!)
    this.setVolume(volume)
    source.start()
    this.source = source
  }

  async pause() {
    this.stopSource()
    this.stopMedia()

    if (this.context?.state === 'running') await this.context.suspend()
  }

  setVolume(volume: number) {
    const safeVolume = this.normalizeVolume(volume)
    if (this.mediaElement) this.mediaElement.volume = safeVolume
    if (!this.gainNode || !this.context) return

    this.gainNode.gain.setTargetAtTime(safeVolume * 0.32, this.context.currentTime, 0.025)
  }

  async dispose() {
    this.stopSource()
    this.stopMedia()

    if (this.context && this.context.state !== 'closed') await this.context.close()

    this.context = null
    this.gainNode = null
  }

  private normalizeVolume(volume: number) {
    return Math.min(1, Math.max(0, volume))
  }

  private stopSource() {
    if (!this.source) return

    try {
      this.source.stop()
    } catch {
      // A source may already have stopped while the UI is being cleaned up.
    }

    this.source.disconnect()
    this.source = null
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
