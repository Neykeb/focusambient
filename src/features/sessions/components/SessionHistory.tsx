import { Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../../../components/atoms/Button'
import type { FocusSession } from '../model/focusSessionSchema'

type SessionHistoryProps = {
  sessions: FocusSession[]
  onClear: () => void
  children?: ReactNode
}

function formatDuration(durationSeconds: number) {
  return `${Math.round(durationSeconds / 60)} min`
}

function formatCompletedAt(completedAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(completedAt))
}

export function SessionHistory({ sessions, onClear, children }: SessionHistoryProps) {
  const totalMinutes = Math.round(
    sessions.reduce((total, session) => total + session.durationSeconds, 0) / 60,
  )

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-5xl flex-col px-5 py-10 sm:px-8 lg:py-14">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">Your progress</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Focus history</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Only sessions completed all the way to zero appear here.</p>
        </div>
        {sessions.length > 0 && (
          <Button variant="secondary" onClick={onClear}>
            <Trash2 size={16} />
            Clear history
          </Button>
        )}
      </div>

      {children}

      <section aria-label="Focus summary" className="mt-10 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-elevated/65 p-5">
          <p className="text-xs text-muted">Completed sessions</p>
          <p className="mt-2 text-3xl font-light tabular-nums">{sessions.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-elevated/65 p-5">
          <p className="text-xs text-muted">Focused time</p>
          <p className="mt-2 text-3xl font-light tabular-nums">{totalMinutes} min</p>
        </div>
      </section>

      {sessions.length === 0 ? (
        <section className="mt-6 grid flex-1 place-items-center rounded-3xl border border-dashed border-line p-10 text-center">
          <div>
            <p className="text-base font-medium">No completed sessions yet</p>
            <p className="mt-2 text-sm text-muted">Complete a focus timer and your first entry will appear here.</p>
          </div>
        </section>
      ) : (
        <ol aria-label="Completed focus sessions" className="mt-6 space-y-3">
          {sessions.map((session) => (
            <li key={session.id} className="flex items-center justify-between gap-5 rounded-2xl border border-line bg-elevated/55 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{session.label}</p>
                <p className="mt-1 text-xs text-muted">{formatCompletedAt(session.completedAt)}</p>
              </div>
              <span className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-accent">
                {formatDuration(session.durationSeconds)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}
