import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTimer } from './useTimer'
import { timerPresets } from '../model/presets'

describe('useTimer', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts from an absolute end time while running', () => {
    const { result } = renderHook(() => useTimer('user-test'))

    act(() => result.current.start())
    act(() => {
      vi.advanceTimersByTime(5_000)
    })

    expect(result.current.remainingSeconds).toBe(1_495)
    expect(result.current.status).toBe('running')
  })

  it('pauses and resumes without losing remaining time', () => {
    const { result } = renderHook(() => useTimer('user-test'))

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(3_000))
    act(() => result.current.pause())

    expect(result.current.remainingSeconds).toBe(1_497)
    expect(result.current.status).toBe('paused')

    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current.remainingSeconds).toBe(1_497)

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(2_000))

    expect(result.current.remainingSeconds).toBe(1_495)
  })

  it('resets and switches presets predictably', () => {
    const { result } = renderHook(() => useTimer('user-test'))

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(4_000))
    act(() => result.current.reset())

    expect(result.current.remainingSeconds).toBe(1_500)
    expect(result.current.status).toBe('idle')

    act(() => result.current.selectPreset(timerPresets[2]))

    expect(result.current.preset.id).toBe('short-break')
    expect(result.current.remainingSeconds).toBe(900)
  })

  it('completes at zero', () => {
    const shortPreset = {
      id: 'short-break' as const,
      label: 'Test',
      compactLabel: 'Test',
      durationSeconds: 2,
    }
    const { result } = renderHook(() => useTimer('user-test', shortPreset))

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(2_000))

    expect(result.current.remainingSeconds).toBe(0)
    expect(result.current.status).toBe('completed')
  })

  it('continues running after the focus page is mounted again', () => {
    const firstPage = renderHook(() => useTimer('user-test'))
    act(() => firstPage.result.current.start())
    act(() => vi.advanceTimersByTime(5_000))
    firstPage.unmount()

    act(() => vi.advanceTimersByTime(10_000))
    const reopenedPage = renderHook(() => useTimer('user-test'))
    act(() => vi.advanceTimersByTime(250))

    expect(reopenedPage.result.current.status).toBe('running')
    expect(reopenedPage.result.current.remainingSeconds).toBe(1_485)
  })

  it('restores a paused timer without counting further', () => {
    const firstPage = renderHook(() => useTimer('user-test'))
    act(() => firstPage.result.current.start())
    act(() => vi.advanceTimersByTime(5_000))
    act(() => firstPage.result.current.pause())
    firstPage.unmount()

    act(() => vi.advanceTimersByTime(10_000))
    const reopenedPage = renderHook(() => useTimer('user-test'))

    expect(reopenedPage.result.current.status).toBe('paused')
    expect(reopenedPage.result.current.remainingSeconds).toBe(1_495)
  })
})
