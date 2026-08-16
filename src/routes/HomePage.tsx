import { useFocusSessions } from '../features/sessions/hooks/useFocusSessions'
import { TimerPanel } from '../features/timer/components/TimerPanel'

type HomePageProps = {
  storageOwnerId: string
}

export function HomePage({ storageOwnerId }: HomePageProps) {
  const { recordSession } = useFocusSessions(storageOwnerId)

  return (
    <main className="flex min-h-[calc(100vh-9.5rem)] flex-col">
      <TimerPanel storageOwnerId={storageOwnerId} onSessionComplete={recordSession} />
    </main>
  )
}
