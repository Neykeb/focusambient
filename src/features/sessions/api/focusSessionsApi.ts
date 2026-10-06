import {
  focusSessionSchema,
  storedFocusSessionsSchema,
  type FocusSession,
  type NewFocusSession,
} from '../model/focusSessionSchema'

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

type GetToken = () => Promise<string | null>

async function apiRequest(path: string, getToken: GetToken, init?: RequestInit) {
  const token = await getToken()
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) throw new Error('The focus history service is unavailable.')
  return response.json() as Promise<unknown>
}

export async function getSessions(getToken: GetToken) {
  const data = await apiRequest('/api/sessions', getToken)
  return storedFocusSessionsSchema.parse(getObjectValue(data, 'sessions'))
}

export async function createSession(input: NewFocusSession, getToken: GetToken) {
  const data = await apiRequest('/api/sessions', getToken, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return focusSessionSchema.parse(getObjectValue(data, 'session'))
}

export async function deleteSessions(getToken: GetToken) {
  await apiRequest('/api/sessions', getToken, { method: 'DELETE' })
}

export async function importSessions(sessions: FocusSession[], getToken: GetToken) {
  const data = await apiRequest('/api/sessions/import', getToken, {
    method: 'POST',
    body: JSON.stringify({ sessions }),
  })
  return storedFocusSessionsSchema.parse(getObjectValue(data, 'sessions'))
}

function getObjectValue(value: unknown, key: string) {
  if (typeof value !== 'object' || value === null || !(key in value)) {
    throw new Error('The server returned unexpected data.')
  }
  return (value as Record<string, unknown>)[key]
}
