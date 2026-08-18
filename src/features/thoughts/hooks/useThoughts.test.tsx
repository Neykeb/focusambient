import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getThoughtsStorageKey, useThoughts } from './useThoughts'

const ownerId = 'user_thought_test'
const storageKey = getThoughtsStorageKey(ownerId)
const thoughtInput = {
  text: 'Answer the email later',
  presetId: 'pomodoro',
  presetLabel: 'Pomodoro',
}

describe('useThoughts', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.setSystemTime(new Date('2026-08-16T14:00:00.000Z'))
  })

  it('saves a thought for the current user', () => {
    const { result } = renderHook(() => useThoughts(ownerId))

    act(() => result.current.addThought(thoughtInput))

    expect(result.current.thoughts[0]).toMatchObject({
      ...thoughtInput,
      isDone: false,
      createdAt: '2026-08-16T14:00:00.000Z',
    })
    expect(window.localStorage.getItem(storageKey)).toContain('Answer the email later')
  })

  it('trims text and rejects an empty thought', () => {
    const { result } = renderHook(() => useThoughts(ownerId))

    act(() => result.current.addThought({ ...thoughtInput, text: '  Useful idea  ' }))
    act(() => result.current.addThought({ ...thoughtInput, text: '   ' }))

    expect(result.current.thoughts).toHaveLength(1)
    expect(result.current.thoughts[0].text).toBe('Useful idea')
  })

  it('marks a thought as done and removes it', () => {
    const { result } = renderHook(() => useThoughts(ownerId))

    act(() => result.current.addThought(thoughtInput))
    const thoughtId = result.current.thoughts[0].id
    act(() => result.current.toggleThought(thoughtId))
    expect(result.current.thoughts[0].isDone).toBe(true)

    act(() => result.current.removeThought(thoughtId))
    expect(result.current.thoughts).toEqual([])
  })

  it('ignores damaged stored thoughts', () => {
    window.localStorage.setItem(storageKey, JSON.stringify([{ text: 'broken' }]))

    const { result } = renderHook(() => useThoughts(ownerId))
    expect(result.current.thoughts).toEqual([])
  })
})
