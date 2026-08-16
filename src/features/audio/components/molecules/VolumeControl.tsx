import { Volume1, Volume2 } from 'lucide-react'

type VolumeControlProps = {
  className?: string
  label: string
  onChange: (volume: number) => void
  showValue?: boolean
  sliderClassName?: string
  volume: number
}

export function VolumeControl({
  className = '',
  label,
  onChange,
  showValue = false,
  sliderClassName = 'w-full',
  volume,
}: VolumeControlProps) {
  const VolumeIcon = volume === 0 ? Volume1 : Volume2
  const percentage = Math.round(volume * 100)

  return (
    <label className={['items-center gap-3 text-xs text-muted', className].join(' ')}>
      <VolumeIcon size={17} />
      <span className="sr-only">{label}</span>
      <input
        aria-label={label}
        type="range"
        min="0"
        max="100"
        value={percentage}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
        className={['accent-[var(--color-accent)]', sliderClassName].join(' ')}
      />
      {showValue && (
        <span className="w-8 text-right tabular-nums">{percentage}%</span>
      )}
    </label>
  )
}
