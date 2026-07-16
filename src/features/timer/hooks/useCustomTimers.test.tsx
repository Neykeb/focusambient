import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getCustomTimersStorageKey, useCustomTimers } from './useCustomTimers'

const ownerId = 'user_test_123'
const storageKey = getCustomTimersStorageKey(ownerId)

describe('useCustomTimers', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('creates and persists a custom timer for its owner', async () => {
    const { result } = renderHook(() => useCustomTimers(ownerId))

    act(() => {
      result.current.addCustomTimer({
        name: 'Morning writing',
        durationMinutes: 35,
      })
    })

    expect(result.current.customTimers[0]).toMatchObject({
      label: 'Morning writing',
      durationSeconds: 2_100,
    })

    await waitFor(() => {
      expect(window.localStorage.getItem(storageKey)).toContain('Morning writing')
    })
  })

  it('keeps timers isolated between users', () => {
    window.localStorage.setItem(
      getCustomTimersStorageKey('user_alex'),
      JSON.stringify([
        {
          id: 'custom-alex',
          label: 'Alex focus',
          compactLabel: 'Alex focus',
          durationSeconds: 1_800,
        },
      ]),
    )

    const { result } = renderHook(() => useCustomTimers('user_sam'))

    expect(result.current.customTimers).toEqual([])
  })

  it('ignores invalid stored data', () => {
    window.localStorage.setItem(storageKey, JSON.stringify([{ label: 'broken' }]))

    const { result } = renderHook(() => useCustomTimers(ownerId))

    expect(result.current.customTimers).toEqual([])
  })

  it('removes a saved timer', () => {
    const { result } = renderHook(() => useCustomTimers(ownerId))

    act(() => {
      result.current.addCustomTimer({
        name: 'Reading',
        durationMinutes: 20,
      })
    })

    const timerId = result.current.customTimers[0].id
    act(() => result.current.removeCustomTimer(timerId))

    expect(result.current.customTimers).toEqual([])
  })
})
