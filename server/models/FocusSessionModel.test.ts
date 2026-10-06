// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { FocusSessionModel } from './FocusSessionModel.js'

describe('FocusSessionModel', () => {
  it('accepts a valid focus session', () => {
    const session = new FocusSessionModel({
      ownerId: 'user-test',
      id: 'session-test',
      presetId: 'pomodoro',
      label: 'Pomodoro',
      durationSeconds: 1_500,
      completedAt: '2026-08-27T12:00:00.000Z',
    })

    expect(session.validateSync()).toBeUndefined()
  })

  it('rejects invalid duration and missing ownership', () => {
    const session = new FocusSessionModel({
      id: 'session-test',
      presetId: 'pomodoro',
      label: 'Pomodoro',
      durationSeconds: 0,
      completedAt: '2026-08-27T12:00:00.000Z',
    })

    expect(session.validateSync()?.errors).toHaveProperty('ownerId')
    expect(session.validateSync()?.errors).toHaveProperty('durationSeconds')
  })
})
