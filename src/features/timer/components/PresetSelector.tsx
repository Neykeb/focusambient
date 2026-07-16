import { timerPresets, type TimerPreset } from '../model/presets'

type PresetSelectorProps = {
  activePreset: TimerPreset
  onSelect: (preset: TimerPreset) => void
}

export function PresetSelector({
  activePreset,
  onSelect,
}: PresetSelectorProps) {
  return (
    <div
      aria-label="Timer presets"
      className="grid w-full max-w-sm grid-cols-3 rounded-full border border-line bg-elevated/80 p-1 sm:inline-grid sm:w-auto"
    >
      {timerPresets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          aria-label={preset.label}
          aria-pressed={preset.id === activePreset.id}
          onClick={() => onSelect(preset)}
          className="min-h-9 rounded-full px-2 text-xs font-medium whitespace-nowrap text-muted transition hover:text-ink aria-pressed:bg-white/8 aria-pressed:text-ink sm:px-4"
        >
          <span className="sm:hidden">{preset.compactLabel}</span>
          <span className="hidden sm:inline">{preset.label}</span>
        </button>
      ))}
    </div>
  )
}
