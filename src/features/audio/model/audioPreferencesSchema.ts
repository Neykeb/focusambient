import { z } from 'zod'
import { isKnownSoundscapeId } from './soundscapes'

export const audioPreferencesSchema = z.object({
  soundscapeId: z.string().min(1).refine(isKnownSoundscapeId),
  volume: z.number().min(0).max(1),
})

export type AudioPreferences = z.infer<typeof audioPreferencesSchema>

export const defaultAudioPreferences: AudioPreferences = {
  soundscapeId: 'rain',
  volume: 0.38,
}
