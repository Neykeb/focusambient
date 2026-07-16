import { useCallback, useEffect, useState } from 'react'
import { storedCustomTimersSchema, type CustomTimerInput } from '../model/customTimerSchema'
import type { TimerPreset } from '../model/presets'

export const CUSTOM_TIMERS_STORAGE_KEY = 'focusambient.custom-timers.v1'

export function getCustomTimersStorageKey(storageOwnerId: string) {
  return `${CUSTOM_TIMERS_STORAGE_KEY}.${encodeURIComponent(storageOwnerId)}`
}

function loadCustomTimers(storageKey: string): TimerPreset[] {
  try {
    const value = window.localStorage.getItem(storageKey)
    if (!value) return []

    const result = storedCustomTimersSchema.safeParse(JSON.parse(value))
    return result.success ? result.data : []
  } catch {
    return []
  }
}

function createTimerId() {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function useCustomTimers(storageOwnerId: string) {
  const storageKey = getCustomTimersStorageKey(storageOwnerId)
  const [customTimers, setCustomTimers] = useState<TimerPreset[]>(() =>
    loadCustomTimers(storageKey),
  )

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(customTimers))
  }, [customTimers, storageKey])

  const addCustomTimer = useCallback((input: CustomTimerInput) => {
    const timer: TimerPreset = {
      id: createTimerId(),
      label: input.name,
      compactLabel: input.name,
      durationSeconds: input.durationMinutes * 60,
    }

    setCustomTimers((current) => [...current, timer])
    return timer
  }, [])

  const removeCustomTimer = useCallback((timerId: string) => {
    setCustomTimers((current) =>
      current.filter((timer) => timer.id !== timerId),
    )
  }, [])

  return { customTimers, addCustomTimer, removeCustomTimer }
}
