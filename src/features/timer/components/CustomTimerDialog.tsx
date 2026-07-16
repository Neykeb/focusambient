import { X } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Button } from '../../../components/atoms/Button'
import { IconButton } from '../../../components/atoms/IconButton'
import {
  customTimerInputSchema,
  type CustomTimerInput,
} from '../model/customTimerSchema'

type CustomTimerDialogProps = {
  onClose: () => void
  onCreate: (input: CustomTimerInput) => void
}

export function CustomTimerDialog({
  onClose,
  onCreate,
}: CustomTimerDialogProps) {
  const nameId = useId()
  const durationId = useId()
  const [name, setName] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('25')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = customTimerInputSchema.safeParse({
      name,
      durationMinutes,
    })

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Check your timer details.')
      return
    }

    onCreate(result.data)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 px-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-timer-title"
        className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 text-left shadow-[0_32px_100px_rgba(0,0,0,0.65)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-accent uppercase">Personal preset</p>
            <h2 id="custom-timer-title" className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">
              Create a focus timer
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Give your session a name and choose a duration.
            </p>
          </div>
          <IconButton label="Close dialog" onClick={onClose}>
            <X size={17} />
          </IconButton>
        </div>

        <form className="mt-7 space-y-5" noValidate onSubmit={handleSubmit}>
          <div>
            <label htmlFor={nameId} className="text-xs font-medium text-ink">
              Timer name
            </label>
            <input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Morning writing"
              autoFocus
              className="mt-2 min-h-12 w-full rounded-xl border border-line bg-canvas/70 px-4 text-sm text-ink outline-none transition placeholder:text-muted/55 focus:border-accent/60"
            />
          </div>
          <div>
            <label htmlFor={durationId} className="text-xs font-medium text-ink">
              Duration in minutes
            </label>
            <input
              id={durationId}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              type="number"
              min="1"
              max="240"
              step="1"
              inputMode="numeric"
              className="mt-2 min-h-12 w-full rounded-xl border border-line bg-canvas/70 px-4 text-sm text-ink outline-none transition focus:border-accent/60"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-xs text-red-200">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save timer</Button>
          </div>
        </form>
      </section>
    </div>
  )
}
