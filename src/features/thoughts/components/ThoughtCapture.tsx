import { Check, Lightbulb, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { IconButton } from '../../../components/atoms/IconButton'
import { useThoughts } from '../hooks/useThoughts'

type ThoughtCaptureProps = {
  storageOwnerId: string
  presetId: string
  presetLabel: string
}

export function ThoughtCapture({
  storageOwnerId,
  presetId,
  presetLabel,
}: ThoughtCaptureProps) {
  const { thoughts, addThought, toggleThought, removeThought } = useThoughts(storageOwnerId)
  const [text, setText] = useState('')
  const [recentThoughtId, setRecentThoughtId] = useState<string | null>(null)
  const openThoughts = thoughts.filter((thought) => !thought.isDone).slice(0, 3)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const thought = addThought({ text, presetId, presetLabel })
    if (!thought) return

    setText('')
    setRecentThoughtId(thought.id)
  }

  return (
    <section aria-labelledby="thought-capture-title" className="mt-6 w-full max-w-xl rounded-2xl border border-line bg-elevated/55 p-4 text-left sm:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
          <Lightbulb size={17} />
        </span>
        <div>
          <h2 id="thought-capture-title" className="text-sm font-medium text-ink">Thought parking</h2>
          <p className="mt-0.5 text-xs text-muted">Save it now. Handle it after your focus time.</p>
        </div>
      </div>

      <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
        <label htmlFor="quick-thought" className="sr-only">Quick thought</label>
        <input
          id="quick-thought"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={160}
          placeholder="What came to mind?"
          className="min-h-11 min-w-0 flex-1 rounded-full border border-line bg-canvas/65 px-4 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-accent/60"
        />
        <IconButton label="Save thought" type="submit" disabled={!text.trim()}>
          <Plus size={18} />
        </IconButton>
      </form>

      {openThoughts.length > 0 && (
        <ul aria-label="Open thoughts" className="mt-4 space-y-2">
          {openThoughts.map((thought) => (
            <li
              key={thought.id}
              onAnimationEnd={() => setRecentThoughtId(null)}
              className={`flex items-center gap-2 rounded-xl border bg-canvas/45 px-3 py-2.5 ${recentThoughtId === thought.id ? 'animate-[thought-arrival_450ms_ease-out] border-accent/45' : 'border-line'}`}
            >
              <p className="min-w-0 flex-1 break-words text-sm text-ink">{thought.text}</p>
              <IconButton label={`Mark "${thought.text}" as done`} onClick={() => toggleThought(thought.id)} className="size-9 shrink-0 border-0 bg-transparent">
                <Check size={16} />
              </IconButton>
              <IconButton label={`Delete "${thought.text}"`} onClick={() => removeThought(thought.id)} className="size-9 shrink-0 border-0 bg-transparent">
                <Trash2 size={15} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      {thoughts.length > openThoughts.length && (
        <p className="mt-3 text-xs text-muted">All thoughts are available in Insights.</p>
      )}
    </section>
  )
}
