import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getFocusSessionsStorageKey, useFocusSessions } from './useFocusSessions'

const ownerId = 'user_history_test'
const storageKey = getFocusSessionsStorageKey(ownerId)
const sessionInput = {
  presetId: 'pomodoro',
  label: 'Pomodoro',
  durationSeconds: 1_500,
}

describe('useFocusSessions', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.setSystemTime(new Date('2026-07-16T14:00:00.000Z'))
  })

  it('records and persists a completed session immediately', () => {
    const { result } = renderHook(() => useFocusSessions(ownerId))

    act(() => result.current.recordSession(sessionInput))

    expect(result.current.sessions[0]).toMatchObject({
      ...sessionInput,
      completedAt: '2026-07-16T14:00:00.000Z',
    })
    expect(window.localStorage.getItem(storageKey)).toContain('Pomodoro')
  })

  it('is immediately available to a newly mounted history route', () => {
    const focusRoute = renderHook(() => useFocusSessions(ownerId))
    act(() => focusRoute.result.current.recordSession(sessionInput))

    const insightsRoute = renderHook(() => useFocusSessions(ownerId))

    expect(insightsRoute.result.current.sessions).toHaveLength(1)
    expect(insightsRoute.result.current.sessions[0].label).toBe('Pomodoro')
  })

  it('keeps histories isolated between users', () => {
    window.localStorage.setItem(
      getFocusSessionsStorageKey('user_alex'),
      JSON.stringify([{ ...sessionInput, id: 'one', completedAt: '2026-07-16T14:00:00.000Z' }]),
    )

    const { result } = renderHook(() => useFocusSessions('user_sam'))
    expect(result.current.sessions).toEqual([])
  })

  it('ignores damaged stored history', () => {
    window.localStorage.setItem(storageKey, JSON.stringify([{ label: 'broken' }]))

    const { result } = renderHook(() => useFocusSessions(ownerId))
    expect(result.current.sessions).toEqual([])
  })

  it('clears the complete history', () => {
    const { result } = renderHook(() => useFocusSessions(ownerId))

    act(() => result.current.recordSession(sessionInput))
    act(() => result.current.clearSessions())

    expect(result.current.sessions).toEqual([])
  })
})
