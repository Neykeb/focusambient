import { useCallback, useEffect, useState } from 'react'
import {
  createSession,
  deleteSessions,
  getSessions,
  importSessions,
} from '../api/focusSessionsApi'
import {
  storedFocusSessionsSchema,
  type FocusSession,
  type NewFocusSession,
} from '../model/focusSessionSchema'

export const FOCUS_SESSIONS_STORAGE_KEY = 'focusambient.focus-sessions.v1'
const MIGRATION_STORAGE_KEY = 'focusambient.focus-sessions-api-migration.v1'

type GetToken = () => Promise<string | null>

export function getFocusSessionsStorageKey(storageOwnerId: string) {
  return `${FOCUS_SESSIONS_STORAGE_KEY}.${encodeURIComponent(storageOwnerId)}`
}

export function useFocusSessions(storageOwnerId: string, getToken: GetToken) {
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) {
        setSessions(readLocalSessions(getFocusSessionsStorageKey(storageOwnerId)) ?? [])
        return
      }

      await migrateLocalSessions(storageOwnerId, getToken)
      setSessions(await getSessions(getToken))
    } catch {
      setError('Focus history could not be loaded. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [getToken, storageOwnerId])

  useEffect(() => {
    void loadSessions()
  }, [loadSessions])

  const recordSession = useCallback(async (input: NewFocusSession) => {
    try {
      const session = await createSession(input, getToken)
      setSessions((current) => [session, ...current].slice(0, 100))
      setError(null)
    } catch {
      setError('The completed session could not be saved.')
    }
  }, [getToken])

  const clearSessions = useCallback(async () => {
    try {
      await deleteSessions(getToken)
      setSessions([])
      setError(null)
    } catch {
      setError('Focus history could not be cleared.')
    }
  }, [getToken])

  return { sessions, isLoading, error, loadSessions, recordSession, clearSessions }
}

async function migrateLocalSessions(storageOwnerId: string, getToken: GetToken) {
  const migrationKey = `${MIGRATION_STORAGE_KEY}.${encodeURIComponent(storageOwnerId)}`
  if (window.localStorage.getItem(migrationKey)) return

  const storageKey = getFocusSessionsStorageKey(storageOwnerId)
  const sessions = readLocalSessions(storageKey)
  if (sessions === null) return

  if (sessions.length > 0) await importSessions(sessions, getToken)
  window.localStorage.removeItem(storageKey)
  window.localStorage.setItem(migrationKey, 'complete')
}

function readLocalSessions(storageKey: string) {
  try {
    const storedValue = window.localStorage.getItem(storageKey)
    if (!storedValue) return []
    const result = storedFocusSessionsSchema.safeParse(JSON.parse(storedValue))
    return result.success ? result.data : null
  } catch {
    return null
  }
}
