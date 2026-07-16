import { SessionHistory } from '../features/sessions/components/SessionHistory'
import { useFocusSessions } from '../features/sessions/hooks/useFocusSessions'

type InsightsPageProps = {
  storageOwnerId: string
}

export function InsightsPage({ storageOwnerId }: InsightsPageProps) {
  const { sessions, clearSessions } = useFocusSessions(storageOwnerId)
  return <SessionHistory sessions={sessions} onClear={clearSessions} />
}
