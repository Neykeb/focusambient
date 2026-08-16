import { CloudRain, Flame, Trees, type LucideIcon } from 'lucide-react'

export type Soundscape = {
  id: string
  label: string
  description: string
  audioUrl: string
  icon: LucideIcon
}

export type SoundscapeId = Soundscape['id']

export const soundscapes: readonly Soundscape[] = [
  {
    id: 'rain',
    label: 'Gentle rain',
    description: 'Soft, steady rainfall',
    audioUrl: '/audio/liecio-calming-rain-257596.mp3',
    icon: CloudRain,
  },
  {
    id: 'forest',
    label: 'Quiet forest',
    description: 'Calm sounds from nature',
    audioUrl: '/audio/soundreality-nature-forest-sound-537925.mp3',
    icon: Trees,
  },
  {
    id: 'fire',
    label: 'Crackling fire',
    description: 'A warm and calming fireplace',
    audioUrl: '/audio/universfield-crackling-fire-229156.mp3',
    icon: Flame,
  },
]

export const defaultSoundscape = soundscapes[0]

export function isKnownSoundscapeId(id: string) {
  return soundscapes.some((soundscape) => soundscape.id === id)
}

export function findSoundscape(id: SoundscapeId) {
  return soundscapes.find((soundscape) => soundscape.id === id) ?? defaultSoundscape
}
