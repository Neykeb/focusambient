export type TimerPresetId = string

export type TimerPreset = {
  id: TimerPresetId
  label: string
  compactLabel: string
  durationSeconds: number
}

export const timerPresets: readonly TimerPreset[] = [
  { id: 'pomodoro', label: 'Pomodoro', compactLabel: 'Pomodoro', durationSeconds: 25 * 60 },
  { id: 'deep-focus', label: 'Deep focus', compactLabel: 'Deep', durationSeconds: 60 * 60 },
  { id: 'short-break', label: 'Short break', compactLabel: 'Break', durationSeconds: 15 * 60 },
]

export const defaultTimerPreset = timerPresets[0]
//Nimm den ersten Timer aus der Liste und benutze ihn als Standard-Timer.
// timerPresets[0] wäre: Pomodoro
