export type TimerPresetId = string

export type TimerPreset = {
  id: TimerPresetId
  label: string
  compactLabel: string
  durationSeconds: number
}

export const timerPresets: readonly TimerPreset[] = [
  { id: 'pomodoro', label: 'Pomodoro', compactLabel: 'Pomodoro', durationSeconds: 25 * 60 },
  { id: 'deep-focus', label: 'Deep focus', compactLabel: 'Deep', durationSeconds: 50 * 60 },
  { id: 'short-break', label: 'Short break', compactLabel: 'Break', durationSeconds: 5 * 60 },
]

export const defaultTimerPreset = timerPresets[0]
