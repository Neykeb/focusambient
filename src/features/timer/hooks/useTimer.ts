import { useCallback, useEffect, useRef, useState } from 'react'
import { defaultTimerPreset, type TimerPreset } from '../model/presets'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

type TimerState = {
  durationSeconds: number
  remainingSeconds: number
  status: TimerStatus
}

export function useTimer(initialPreset: TimerPreset = defaultTimerPreset) {
  const [preset, setPreset] = useState(initialPreset)
  const [state, setState] = useState<TimerState>({
    durationSeconds: initialPreset.durationSeconds,
    remainingSeconds: initialPreset.durationSeconds,
    status: 'idle',
  })
  const endsAtRef = useRef<number | null>(null)

  const syncRemainingTime = useCallback(() => {
    if (endsAtRef.current === null) return

    const remainingSeconds = Math.max(
      0,
      Math.ceil((endsAtRef.current - Date.now()) / 1_000),
    )

    setState((current) => {
      if (remainingSeconds === 0) {
        endsAtRef.current = null
        return { ...current, remainingSeconds: 0, status: 'completed' }
      }

      return { ...current, remainingSeconds }
    })
  }, [])

  useEffect(() => {
    if (state.status !== 'running') return

    syncRemainingTime()
    const intervalId = window.setInterval(syncRemainingTime, 250)

    return () => window.clearInterval(intervalId)
  }, [state.status, syncRemainingTime])

  const start = useCallback(() => {
    setState((current) => {
      if (current.remainingSeconds === 0 || current.status === 'running') {
        return current
      }

      endsAtRef.current = Date.now() + current.remainingSeconds * 1_000
      return { ...current, status: 'running' }
    })
  }, [])

  const pause = useCallback(() => {
    if (endsAtRef.current === null) return

    const remainingSeconds = Math.max(
      0,
      Math.ceil((endsAtRef.current - Date.now()) / 1_000),
    )
    endsAtRef.current = null
    setState((current) => ({
      ...current,
      remainingSeconds,
      status: remainingSeconds === 0 ? 'completed' : 'paused',
    }))
  }, [])

  const reset = useCallback(() => {
    endsAtRef.current = null
    setState((current) => ({
      ...current,
      remainingSeconds: current.durationSeconds,
      status: 'idle',
    }))
  }, [])

  const selectPreset = useCallback((nextPreset: TimerPreset = defaultTimerPreset) => {
    endsAtRef.current = null
    setPreset(nextPreset)
    setState({
      durationSeconds: nextPreset.durationSeconds,
      remainingSeconds: nextPreset.durationSeconds,
      status: 'idle',
    })
  }, [])

  return {
    ...state,
    preset,
    start,
    pause,
    reset,
    selectPreset,
  }
}
