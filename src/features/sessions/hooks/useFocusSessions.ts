import { useCallback, useEffect, useRef, useState } from 'react'
import { storedFocusSessionsSchema, type FocusSession, type NewFocusSession } from '../model/focusSessionSchema'

export const FOCUS_SESSIONS_STORAGE_KEY = 'focusambient.focus-sessions.v1'
const MAX_STORED_SESSIONS = 100

export function getFocusSessionsStorageKey(storageOwnerId: string) {
  return `${FOCUS_SESSIONS_STORAGE_KEY}.${encodeURIComponent(storageOwnerId)}`
}

function loadFocusSessions(storageKey: string): FocusSession[] {
  try {
    const storedValue = window.localStorage.getItem(storageKey)
    if (!storedValue) return []

    const result = storedFocusSessionsSchema.safeParse(JSON.parse(storedValue))
    return result.success ? result.data : []
  } catch {
    return []
  }
}

function createSessionId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function useFocusSessions(storageOwnerId: string) {
  const storageKey = getFocusSessionsStorageKey(storageOwnerId)
  const initialSessions = loadFocusSessions(storageKey)
  const sessionsRef = useRef<FocusSession[]>(initialSessions)
  const [sessions, setSessions] = useState<FocusSession[]>(initialSessions)

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      const nextSessions = loadFocusSessions(storageKey)
      sessionsRef.current = nextSessions
      setSessions(nextSessions)
    }

    window.addEventListener('storage', syncFromStorage)
    return () => window.removeEventListener('storage', syncFromStorage)
  }, [storageKey])

  const recordSession = useCallback((input: NewFocusSession) => {
    const session: FocusSession = {
      ...input,
      id: createSessionId(),
      completedAt: new Date().toISOString(),
    }
    const nextSessions = [session, ...sessionsRef.current].slice(0, MAX_STORED_SESSIONS)

    window.localStorage.setItem(storageKey, JSON.stringify(nextSessions))
    sessionsRef.current = nextSessions
    setSessions(nextSessions)
    return session
  }, [storageKey])

  const clearSessions = useCallback(() => {
    window.localStorage.setItem(storageKey, JSON.stringify([]))
    sessionsRef.current = []
    setSessions([])
  }, [storageKey])

  return { sessions, recordSession, clearSessions }
}
