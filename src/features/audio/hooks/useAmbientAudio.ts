import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createAmbientAudioEngine,
  type AmbientAudioEngine,
} from '../lib/AmbientAudioEngine'
import {
  audioPreferencesSchema,
  defaultAudioPreferences,
} from '../model/audioPreferencesSchema'
import {
  findSoundscape,
  type SoundscapeId,
} from '../model/soundscapes'

export const AUDIO_PREFERENCES_STORAGE_KEY = 'focusambient.audio-preferences.v1'

type EngineFactory = () => AmbientAudioEngine

function loadPreferences() {
  try {
    const stored = window.localStorage.getItem(AUDIO_PREFERENCES_STORAGE_KEY)
    if (!stored) return defaultAudioPreferences

    const result = audioPreferencesSchema.safeParse(JSON.parse(stored))
    return result.success ? result.data : defaultAudioPreferences
  } catch {
    return defaultAudioPreferences
  }
}

export function useAmbientAudio(
  engineFactory: EngineFactory = createAmbientAudioEngine,
) {
  const [preferences, setPreferences] = useState(loadPreferences)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const engineRef = useRef<AmbientAudioEngine | null>(null)

  const getEngine = useCallback(() => {
    if (!engineRef.current) engineRef.current = engineFactory()
    return engineRef.current
  }, [engineFactory])

  useEffect(() => {
    window.localStorage.setItem(
      AUDIO_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    )
  }, [preferences])

  useEffect(
    () => () => {
      if (engineRef.current) void engineRef.current.dispose()
    },
    [],
  )

  const togglePlayback = useCallback(async () => {
    setError(null)

    try {
      if (isPlaying) {
        await getEngine().pause()
        setIsPlaying(false)
        return
      }

      await getEngine().play(
        findSoundscape(preferences.soundscapeId),
        preferences.volume,
      )
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
      setError('Audio could not start. Check your browser audio settings.')
    }
  }, [getEngine, isPlaying, preferences])

  const selectSoundscape = useCallback(
    async (soundscapeId: SoundscapeId) => {
      const nextPreferences = { ...preferences, soundscapeId }
      setPreferences(nextPreferences)
      setError(null)

      if (!isPlaying) return

      try {
        await getEngine().play(
          findSoundscape(soundscapeId),
          nextPreferences.volume,
        )
      } catch {
        setIsPlaying(false)
        setError('This sound could not be loaded.')
      }
    },
    [getEngine, isPlaying, preferences],
  )

  const setVolume = useCallback((volume: number) => {
    const safeVolume = Math.min(1, Math.max(0, volume))
    setPreferences((current) => ({ ...current, volume: safeVolume }))
    engineRef.current?.setVolume(safeVolume)
  }, [])

  return {
    ...preferences,
    soundscape: findSoundscape(preferences.soundscapeId),
    isPlaying,
    error,
    togglePlayback,
    selectSoundscape,
    setVolume,
  }
}
