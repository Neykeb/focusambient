import { SessionHistory } from '../features/sessions/components/SessionHistory'
import { useFocusSessions } from '../features/sessions/hooks/useFocusSessions'
import { ThoughtArchive } from '../features/thoughts/components/ThoughtArchive'
import { useThoughts } from '../features/thoughts/hooks/useThoughts'

type InsightsPageProps = {
  storageOwnerId: string
}

export function InsightsPage({ storageOwnerId }: InsightsPageProps) {
  const { sessions, clearSessions } = useFocusSessions(storageOwnerId)
  const { thoughts, toggleThought, removeThought } = useThoughts(storageOwnerId)

  return (
    <SessionHistory sessions={sessions} onClear={clearSessions}>
      <ThoughtArchive
        thoughts={thoughts}
        onToggle={toggleThought}
        onRemove={removeThought}
      />
    </SessionHistory>
  )
}
