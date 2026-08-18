import { Check, RotateCcw, Trash2 } from 'lucide-react'
import { IconButton } from '../../../components/atoms/IconButton'
import type { Thought } from '../model/thoughtSchema'

type ThoughtArchiveProps = {
  thoughts: Thought[]
  onToggle: (thoughtId: string) => void
  onRemove: (thoughtId: string) => void
}

function formatCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(createdAt))
}

export function ThoughtArchive({ thoughts, onToggle, onRemove }: ThoughtArchiveProps) {
  const openCount = thoughts.filter((thought) => !thought.isDone).length

  return (
    <section aria-labelledby="thought-archive-title" className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">Thought parking</p>
          <h2 id="thought-archive-title" className="mt-2 text-xl font-semibold">Saved thoughts</h2>
        </div>
        <p className="text-xs text-muted">{openCount} open</p>
      </div>

      {thoughts.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
          Thoughts saved during focus time will appear here.
        </div>
      ) : (
        <ul aria-label="Saved thoughts" className="mt-4 space-y-2">
          {thoughts.map((thought) => (
            <li key={thought.id} className="flex items-center gap-3 rounded-2xl border border-line bg-elevated/55 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className={`break-words text-sm ${thought.isDone ? 'text-muted line-through' : 'text-ink'}`}>{thought.text}</p>
                <p className="mt-1 text-xs text-muted">{thought.presetLabel} · {formatCreatedAt(thought.createdAt)}</p>
              </div>
              <IconButton
                label={thought.isDone ? `Reopen "${thought.text}"` : `Mark "${thought.text}" as done`}
                onClick={() => onToggle(thought.id)}
                className="size-9 shrink-0"
              >
                {thought.isDone ? <RotateCcw size={15} /> : <Check size={16} />}
              </IconButton>
              <IconButton label={`Delete "${thought.text}"`} onClick={() => onRemove(thought.id)} className="size-9 shrink-0">
                <Trash2 size={15} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
