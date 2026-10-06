import { SessionHistory } from "../features/sessions/components/SessionHistory";
import { useFocusSessions } from "../features/sessions/hooks/useFocusSessions";
import { ThoughtArchive } from "../features/thoughts/components/ThoughtArchive";
import { useThoughts } from "../features/thoughts/hooks/useThoughts";

type InsightsPageProps = {
  storageOwnerId: string;
  getToken: () => Promise<string | null>;
};

export function InsightsPage({ storageOwnerId, getToken }: InsightsPageProps) {
  const { sessions, isLoading, error, loadSessions, clearSessions } =
    useFocusSessions(storageOwnerId, getToken);
  const { thoughts, toggleThought, removeThought } = useThoughts(
    storageOwnerId,
    getToken,
  );

  return (
    <SessionHistory
      sessions={sessions}
      isLoading={isLoading}
      error={error}
      onRetry={loadSessions}
      onClear={clearSessions}
    >
      <ThoughtArchive
        thoughts={thoughts}
        onToggle={toggleThought}
        onRemove={removeThought}
      />
    </SessionHistory>
  );
}
