import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TimerStatus } from '../../timer/hooks/useTimer'
import { useCompletedSessionRecorder } from './useCompletedSessionRecorder'

const session = {
  presetId: 'pomodoro',
  label: 'Pomodoro',
  durationSeconds: 1_500,
}

describe('useCompletedSessionRecorder', () => {
  it('records a completed transition exactly once', () => {
    const onComplete = vi.fn()
    const { rerender } = renderHook(
      ({ status }: { status: TimerStatus }) =>
        useCompletedSessionRecorder(status, session, onComplete),
      { initialProps: { status: 'idle' as TimerStatus } },
    )

    rerender({ status: 'running' })
    rerender({ status: 'completed' })
    rerender({ status: 'completed' })

    expect(onComplete).toHaveBeenCalledOnce()
    expect(onComplete).toHaveBeenCalledWith(session)
  })

  it('does not record paused or reset sessions', () => {
    const onComplete = vi.fn()
    const { rerender } = renderHook(
      ({ status }: { status: TimerStatus }) =>
        useCompletedSessionRecorder(status, session, onComplete),
      { initialProps: { status: 'idle' as TimerStatus } },
    )

    rerender({ status: 'running' })
    rerender({ status: 'paused' })
    rerender({ status: 'idle' })

    expect(onComplete).not.toHaveBeenCalled()
  })
})
