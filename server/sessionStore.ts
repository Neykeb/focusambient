import type { FocusSession } from '../src/features/sessions/model/focusSessionSchema.js'
import { FocusSessionModel } from './models/FocusSessionModel.js'

const MAX_SESSIONS = 100

export type SessionStore = {
  getAll: (userId: string) => Promise<FocusSession[]>
  add: (userId: string, session: FocusSession) => Promise<FocusSession>
  import: (userId: string, sessions: FocusSession[]) => Promise<FocusSession[]>
  clear: (userId: string) => Promise<void>
}

export class MongoSessionStore implements SessionStore {
  async getAll(userId: string) {
    const sessions = await FocusSessionModel.find({ ownerId: userId })
      .sort({ completedAt: -1 })
      .limit(MAX_SESSIONS)
      .select('-_id id presetId label durationSeconds completedAt')
      .lean()

    return sessions as FocusSession[]
  }

  async add(userId: string, session: FocusSession) {
    await FocusSessionModel.create({ ownerId: userId, ...session })
    await this.removeOldSessions(userId)
    return session
  }

  async import(userId: string, sessions: FocusSession[]) {
    if (sessions.length > 0) {
      await FocusSessionModel.bulkWrite(
        sessions.map((session) => ({
          updateOne: {
            filter: { ownerId: userId, id: session.id },
            update: { $setOnInsert: { ownerId: userId, ...session } },
            upsert: true,
          },
        })),
      )
      await this.removeOldSessions(userId)
    }

    return this.getAll(userId)
  }

  async clear(userId: string) {
    await FocusSessionModel.deleteMany({ ownerId: userId })
  }

  private async removeOldSessions(userId: string) {
    const oldSessions = await FocusSessionModel.find({ ownerId: userId })
      .sort({ completedAt: -1 })
      .skip(MAX_SESSIONS)
      .select('_id')
      .lean()

    if (oldSessions.length > 0) {
      await FocusSessionModel.deleteMany({
        _id: { $in: oldSessions.map((session) => session._id) },
      })
    }
  }
}
