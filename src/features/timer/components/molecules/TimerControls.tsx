import { Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '../../../../components/atoms/Button'
import { IconButton } from '../../../../components/atoms/IconButton'
import type { TimerStatus } from '../../hooks/useTimer'

type TimerControlsProps = {
  canReset: boolean
  onPause: () => void
  onReset: () => void
  onStart: () => void
  status: TimerStatus
}

export function TimerControls({
  canReset,
  onPause,
  onReset,
  onStart,
  status,
}: TimerControlsProps) {
  const isRunning = status === 'running'

  return (
    <div className="mt-8 flex items-center gap-3">
      <IconButton label="Reset timer" disabled={!canReset} onClick={onReset}>
        <RotateCcw size={17} />
      </IconButton>
      <Button
        className="min-w-36"
        onClick={isRunning ? onPause : onStart}
        disabled={status === 'completed'}
      >
        {isRunning ? (
          <Pause size={17} fill="currentColor" />
        ) : (
          <Play size={17} fill="currentColor" />
        )}
        {isRunning ? 'Pause' : status === 'paused' ? 'Resume' : 'Start focus'}
      </Button>
    </div>
  )
}
