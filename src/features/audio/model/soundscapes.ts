import { Coffee, CloudRain, Music2, Trees, type LucideIcon } from 'lucide-react'
import { externalSoundscapes } from './externalSoundscapes'

export type GeneratedSoundscape = {
  id: string
  label: string
  description: string
  source: 'generated'
  filterType: BiquadFilterType
  filterFrequency: number
  noise: 'white' | 'brown'
  icon: LucideIcon
}

export type ExternalSoundscape = {
  id: string
  label: string
  description: string
  source: 'file'
  audioUrl: string
  icon?: LucideIcon
}

type ResolvedExternalSoundscape = Omit<ExternalSoundscape, 'icon'> & {
  icon: LucideIcon
}

export type Soundscape = GeneratedSoundscape | ResolvedExternalSoundscape
export type SoundscapeId = Soundscape['id']

const generatedSoundscapes: readonly GeneratedSoundscape[] = [
  {
    id: 'rain',
    label: 'Gentle rain',
    description: 'Soft, steady rainfall',
    source: 'generated',
    filterType: 'highpass',
    filterFrequency: 620,
    noise: 'white',
    icon: CloudRain,
  },
  {
    id: 'forest',
    label: 'Quiet forest',
    description: 'Low, calming nature hush',
    source: 'generated',
    filterType: 'lowpass',
    filterFrequency: 950,
    noise: 'brown',
    icon: Trees,
  },
  {
    id: 'cafe',
    label: 'Distant café',
    description: 'Warm background murmur',
    source: 'generated',
    filterType: 'bandpass',
    filterFrequency: 480,
    noise: 'brown',
    icon: Coffee,
  },
]

const resolvedExternalSoundscapes: readonly ResolvedExternalSoundscape[] =
  externalSoundscapes.map((soundscape) => ({
    ...soundscape,
    icon: soundscape.icon ?? Music2,
  }))

export const soundscapes: readonly Soundscape[] = [
  ...generatedSoundscapes,
  ...resolvedExternalSoundscapes,
]

export const defaultSoundscape = soundscapes[0]

export function isKnownSoundscapeId(id: string) {
  return soundscapes.some((soundscape) => soundscape.id === id)
}

export function findSoundscape(id: SoundscapeId) {
  return soundscapes.find((soundscape) => soundscape.id === id) ?? defaultSoundscape
}
