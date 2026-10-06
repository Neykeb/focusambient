import { readFile, rename } from 'node:fs/promises'
import { resolve } from 'node:path'
import { z } from 'zod'
import { focusSessionSchema } from '../../src/features/sessions/model/focusSessionSchema.js'
import type { SessionStore } from '../sessionStore.js'

const legacyFile = resolve('server/data/sessions.json')
const backupFile = resolve('server/data/sessions.migrated.json')
const legacySessionsSchema = z.record(z.string(), z.array(focusSessionSchema).max(100))

export async function migrateJsonSessions(store: SessionStore) {
  try {
    const content = await readFile(legacyFile, 'utf8')
    const sessionsByUser = legacySessionsSchema.parse(JSON.parse(content))

    for (const [userId, sessions] of Object.entries(sessionsByUser)) {
      await store.import(userId, sessions)
    }

    await rename(legacyFile, backupFile)
    console.log('Existing JSON sessions were imported into MongoDB.')
  } catch (error) {
    if (isMissingFile(error)) return
    throw new Error('Existing JSON sessions could not be migrated.', { cause: error })
  }
}

function isMissingFile(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}
