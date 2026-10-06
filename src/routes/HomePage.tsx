import { useFocusSessions } from "../features/sessions/hooks/useFocusSessions";
import { TimerPanel } from "../features/timer/components/TimerPanel";

type HomePageProps = {
  storageOwnerId: string;
  getToken: () => Promise<string | null>;
};

export function HomePage({ storageOwnerId, getToken }: HomePageProps) {
  const { error, recordSession } = useFocusSessions(storageOwnerId, getToken);

  return (
    <main className="flex min-h-[calc(100vh-9.5rem)] flex-col">
      <TimerPanel
        storageOwnerId={storageOwnerId}
        getToken={getToken}
        sessionError={error}
        onSessionComplete={recordSession}
      />
    </main>
  );
}
