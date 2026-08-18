import { useState } from 'react'
import {
  storedThoughtsSchema,
  thoughtTextSchema,
  type NewThought,
  type Thought,
} from '../model/thoughtSchema'

export const THOUGHTS_STORAGE_KEY = 'focusambient.thoughts.v1'
const MAX_STORED_THOUGHTS = 100

export function getThoughtsStorageKey(storageOwnerId: string) {
  return `${THOUGHTS_STORAGE_KEY}.${encodeURIComponent(storageOwnerId)}`
}

function loadThoughts(storageKey: string): Thought[] {
  try {
    const storedValue = window.localStorage.getItem(storageKey)
    if (!storedValue) return []

    const result = storedThoughtsSchema.safeParse(JSON.parse(storedValue))
    return result.success ? result.data : []
  } catch {
    return []
  }
}

function createThoughtId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `thought-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function useThoughts(storageOwnerId: string) {
  const storageKey = getThoughtsStorageKey(storageOwnerId)
  const [thoughts, setThoughts] = useState<Thought[]>(() => loadThoughts(storageKey))

  const saveThoughts = (nextThoughts: Thought[]) => {
    window.localStorage.setItem(storageKey, JSON.stringify(nextThoughts))
    setThoughts(nextThoughts)
  }

  const addThought = (input: NewThought) => {
    const textResult = thoughtTextSchema.safeParse(input.text)
    if (!textResult.success) return null

    const thought: Thought = {
      ...input,
      id: createThoughtId(),
      text: textResult.data,
      createdAt: new Date().toISOString(),
      isDone: false,
    }

    saveThoughts([thought, ...thoughts].slice(0, MAX_STORED_THOUGHTS))
    return thought
  }

  const toggleThought = (thoughtId: string) => {
    saveThoughts(
      thoughts.map((thought) =>
        thought.id === thoughtId
          ? { ...thought, isDone: !thought.isDone }
          : thought,
      ),
    )
  }

  const removeThought = (thoughtId: string) => {
    saveThoughts(thoughts.filter((thought) => thought.id !== thoughtId))
  }

  return { thoughts, addThought, toggleThought, removeThought }
}
