import { useEffect, useRef } from 'react'
import type { TimerStatus } from '../../timer/hooks/useTimer'
import type { NewFocusSession } from '../model/focusSessionSchema'

export function useCompletedSessionRecorder(
  status: TimerStatus,
  session: NewFocusSession,
  onComplete?: (session: NewFocusSession) => void,
) {
  const previousStatusRef = useRef(status)

  useEffect(() => {
    if (status === 'completed' && previousStatusRef.current !== 'completed') {
      onComplete?.(session)
    }
    previousStatusRef.current = status
  }, [onComplete, session, status])
}
