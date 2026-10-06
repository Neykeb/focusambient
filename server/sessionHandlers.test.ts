// @vitest-environment node

import type { Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSessionHandlers } from './sessionHandlers.js'
import type { FocusSession } from '../src/features/sessions/model/focusSessionSchema.js'
import type { SessionStore } from './sessionStore.js'

const validSession = {
  presetId: 'pomodoro',
  label: 'Pomodoro',
  durationSeconds: 1_500,
}

describe('session handlers', () => {
  let store: SessionStore
  let sessionsByUser: Map<string, FocusSession[]>

  beforeEach(() => {
    sessionsByUser = new Map()
    store = {
      getAll: async (userId) => sessionsByUser.get(userId) ?? [],
      add: async (userId, session) => {
        sessionsByUser.set(userId, [session, ...(sessionsByUser.get(userId) ?? [])])
        return session
      },
      import: async (userId, sessions) => {
        sessionsByUser.set(userId, sessions)
        return sessions
      },
      clear: async (userId) => {
        sessionsByUser.set(userId, [])
      },
    }
  })

  function setup(userId: string | null, body: unknown = {}) {
    const handlers = createSessionHandlers(store, () => userId)
    const request = { body } as Request
    const result = { status: 200, body: undefined as unknown }
    const response = {
      status: vi.fn((status: number) => {
        result.status = status
        return response
      }),
      json: vi.fn((bodyValue: unknown) => {
        result.body = bodyValue
        return response
      }),
    } as unknown as Response

    return { handlers, request, response, result }
  }

  it('rejects requests without a signed-in user', async () => {
    const { handlers, request, response, result } = setup(null)
    await handlers.get(request, response)
    expect(result.status).toBe(401)
  })

  it('validates, saves and returns a session', async () => {
    const creation = setup('user_alex', validSession)
    await creation.handlers.create(creation.request, creation.response)
    const loading = setup('user_alex')
    await loading.handlers.get(loading.request, loading.response)

    expect(creation.result.status).toBe(201)
    expect(creation.result.body).toMatchObject({ session: validSession })
    expect(loading.result.body).toMatchObject({ sessions: [validSession] })
  })

  it('rejects invalid session data', async () => {
    const test = setup('user_alex', { ...validSession, durationSeconds: 0 })
    await test.handlers.create(test.request, test.response)
    expect(test.result.status).toBe(400)
  })

  it('keeps users isolated when reading and deleting', async () => {
    const creation = setup('user_alex', validSession)
    await creation.handlers.create(creation.request, creation.response)
    const deletion = setup('user_sam')
    await deletion.handlers.clear(deletion.request, deletion.response)

    const alex = setup('user_alex')
    const sam = setup('user_sam')
    await alex.handlers.get(alex.request, alex.response)
    await sam.handlers.get(sam.request, sam.response)
    expect(alex.result.body).toMatchObject({ sessions: [validSession] })
    expect(sam.result.body).toEqual({ sessions: [] })
  })
})
