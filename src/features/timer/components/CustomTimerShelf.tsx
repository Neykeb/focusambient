import { Plus, X } from 'lucide-react'
import { Button } from '../../../components/atoms/Button'
import type { TimerPreset } from '../model/presets'

type CustomTimerShelfProps = {
  timers: TimerPreset[]
  activeTimerId: string
  onCreate: () => void
  onRemove: (timerId: string) => void
  onSelect: (timer: TimerPreset) => void
}

export function CustomTimerShelf({
  timers,
  activeTimerId,
  onCreate,
  onRemove,
  onSelect,
}: CustomTimerShelfProps) {
  return (
    <div className="mt-3 flex max-w-full flex-wrap items-center justify-center gap-2">
      {timers.map((timer) => (
        <div
          key={timer.id}
          className="inline-flex items-center rounded-full border border-line bg-elevated/70 p-1"
        >
          <button
            type="button"
            aria-pressed={activeTimerId === timer.id}
            onClick={() => onSelect(timer)}
            className="min-h-8 max-w-40 truncate rounded-full px-3 text-xs text-muted transition hover:text-ink aria-pressed:bg-white/8 aria-pressed:text-ink"
          >
            {timer.label}
            <span className="ml-1.5 text-[0.65rem] opacity-60">
              {timer.durationSeconds / 60}m
            </span>
          </button>
          <button
            type="button"
            aria-label={`Delete ${timer.label}`}
            onClick={() => onRemove(timer.id)}
            className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-white/5 hover:text-ink"
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <Button variant="ghost" className="min-h-9 px-3 text-xs" onClick={onCreate}>
        <Plus size={15} />
        New timer
      </Button>
    </div>
  )
}
