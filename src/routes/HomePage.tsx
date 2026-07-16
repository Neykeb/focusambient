import { useCallback } from 'react'
import { useFocusSessions } from '../features/sessions/hooks/useFocusSessions'
import type { NewFocusSession } from '../features/sessions/model/focusSessionSchema'
import { TimerPanel } from '../features/timer/components/TimerPanel'

type HomePageProps = {
  storageOwnerId: string
}

export function HomePage({ storageOwnerId }: HomePageProps) {
  const { recordSession } = useFocusSessions(storageOwnerId)
  const handleSessionComplete = useCallback(
    (session: NewFocusSession) => recordSession(session),
    [recordSession],
  )

  return (
    <main className="flex min-h-[calc(100vh-9.5rem)] flex-col">
      <TimerPanel storageOwnerId={storageOwnerId} onSessionComplete={handleSessionComplete} />
    </main>
  )
}
