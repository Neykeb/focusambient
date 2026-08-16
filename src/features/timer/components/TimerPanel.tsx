import { useState } from 'react'
import { useCompletedSessionRecorder } from '../../sessions/hooks/useCompletedSessionRecorder'
import { useCustomTimers } from '../hooks/useCustomTimers'
import { useTimer, type TimerStatus } from '../hooks/useTimer'
import type { CustomTimerInput } from '../model/customTimerSchema'
import { formatTime } from '../utils/formatTime'
import { CustomTimerDialog } from './CustomTimerDialog'
import { CustomTimerShelf } from './CustomTimerShelf'
import { TimerControls } from './molecules/TimerControls'
import { PresetSelector } from './PresetSelector'

const statusLabels: Record<TimerStatus, string> = {
  idle: 'Ready when you are',
  running: 'Stay with the moment',
  paused: 'Session paused',
  completed: 'Session complete',
}

type TimerPanelProps = {
  storageOwnerId: string
  onSessionComplete?: (session: { presetId: string; label: string; durationSeconds: number }) => void
}

export function TimerPanel({ storageOwnerId, onSessionComplete }: TimerPanelProps) {
  const timer = useTimer()
  const { customTimers, addCustomTimer, removeCustomTimer } = useCustomTimers(storageOwnerId)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  useCompletedSessionRecorder(
    timer.status,
    {
      presetId: timer.preset.id,
      label: timer.preset.label,
      durationSeconds: timer.durationSeconds,
    },
    onSessionComplete,
  )
  const elapsedRatio = 1 - timer.remainingSeconds / timer.durationSeconds
  const progressOffset = Math.min(100, Math.max(0, elapsedRatio * 100))
  const canReset =
    timer.status !== 'idle' ||
    timer.remainingSeconds !== timer.durationSeconds

  const createCustomTimer = (input: CustomTimerInput) => {
    const newTimer = addCustomTimer(input)
    timer.selectPreset(newTimer)
    setIsDialogOpen(false)
  }

  const removeTimer = (timerId: string) => {
    removeCustomTimer(timerId)
    if (timer.preset.id === timerId) timer.selectPreset()
  }

  return (
    <>
      <section
        aria-labelledby="focus-heading"
        className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center sm:px-8"
      >
        <PresetSelector
          activePreset={timer.preset}
          onSelect={timer.selectPreset}
        />
        <CustomTimerShelf
          timers={customTimers}
          activeTimerId={timer.preset.id}
          onCreate={() => setIsDialogOpen(true)}
          onRemove={removeTimer}
          onSelect={timer.selectPreset}
        />

        <div className="relative mt-7 grid size-[min(72vw,25rem)] place-items-center rounded-full border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.008))] shadow-[0_40px_120px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.09)] sm:mt-9">
          <div className="absolute inset-3 rounded-full border border-accent/10" />
          <svg aria-hidden="true" className="absolute inset-0 size-full -rotate-90" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="3" />
            <circle
              cx="200"
              cy="200"
              r="196"
              fill="none"
              pathLength="100"
              stroke="currentColor"
              strokeDasharray="100"
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              strokeWidth="3"
              className="text-accent drop-shadow-[0_0_8px_rgba(147,226,186,0.35)] transition-[stroke-dashoffset] duration-300"
            />
          </svg>

          <div className="relative">
            <p className="text-[0.68rem] font-semibold tracking-[0.24em] text-muted uppercase">
              {timer.preset.label}
            </p>
            <p aria-live="off" className="mt-3 text-[clamp(3.4rem,10vw,5.7rem)] font-extralight leading-none tracking-[-0.075em] text-ink tabular-nums">
              {formatTime(timer.remainingSeconds)}
            </p>
            <p aria-live="polite" className="mt-4 text-xs text-muted">
              {statusLabels[timer.status]}
            </p>
          </div>
        </div>

        <h1 id="focus-heading" className="sr-only">Focus timer</h1>
        <TimerControls
          status={timer.status}
          canReset={canReset}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={timer.reset}
        />
      </section>

      {isDialogOpen && (
        <CustomTimerDialog
          onClose={() => setIsDialogOpen(false)}
          onCreate={createCustomTimer}
        />
      )}
    </>
  )
}
