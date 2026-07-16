import {
  ChevronDown,
  Pause,
  Play,
  SlidersHorizontal,
  Volume1,
  Volume2,
} from 'lucide-react'
import { useState } from 'react'
import { IconButton } from '../../../components/atoms/IconButton'
import type { AmbientAudioEngine } from '../lib/AmbientAudioEngine'
import { useAmbientAudio } from '../hooks/useAmbientAudio'
import { soundscapes } from '../model/soundscapes'

type AudioDockProps = {
  engineFactory?: () => AmbientAudioEngine
}

export function AudioDock({ engineFactory }: AudioDockProps) {
  const audio = useAmbientAudio(engineFactory)
  const [isExpanded, setIsExpanded] = useState(false)
  const ActiveIcon = audio.soundscape.icon
  const VolumeIcon = audio.volume === 0 ? Volume1 : Volume2

  return (
    <aside
      aria-label="Ambient audio"
      className="mx-4 mb-4 rounded-2xl border border-line bg-elevated/90 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:mx-auto sm:mb-6 sm:w-[min(92%,42rem)]"
    >
      {isExpanded && (
        <div className="border-b border-line p-3 sm:p-4">
          <p className="px-1 text-[0.68rem] font-semibold tracking-[0.18em] text-muted uppercase">
            Choose your atmosphere
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {soundscapes.map((soundscape) => {
              const Icon = soundscape.icon
              const isSelected = soundscape.id === audio.soundscapeId

              return (
                <button
                  key={soundscape.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => void audio.selectSoundscape(soundscape.id)}
                  className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-transparent px-2 text-xs text-muted transition hover:bg-white/4 hover:text-ink aria-pressed:border-accent/20 aria-pressed:bg-accent/8 aria-pressed:text-accent"
                >
                  <Icon size={18} />
                  {soundscape.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 p-3">
        <IconButton
          label={audio.isPlaying ? 'Pause ambient sound' : 'Play ambient sound'}
          onClick={() => void audio.togglePlayback()}
          className="border-accent/15 bg-accent/10 text-accent hover:text-accent-strong"
        >
          {audio.isPlaying ? (
            <Pause size={17} fill="currentColor" />
          ) : (
            <Play size={17} fill="currentColor" />
          )}
        </IconButton>

        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/4 text-muted">
          <ActiveIcon size={18} />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-ink">
            {audio.soundscape.label}
          </p>
          <p aria-live="polite" className="mt-0.5 truncate text-xs text-muted">
            {audio.error ??
              `${audio.soundscape.description} · ${audio.isPlaying ? 'playing' : 'paused'}`}
          </p>
        </div>

        <VolumeIcon className="hidden shrink-0 text-muted sm:block" size={17} />
        <input
          aria-label="Ambient volume"
          type="range"
          min="0"
          max="100"
          value={Math.round(audio.volume * 100)}
          onChange={(event) => audio.setVolume(Number(event.target.value) / 100)}
          className="hidden w-24 accent-[var(--color-accent)] sm:block"
        />

        <IconButton
          label={isExpanded ? 'Close audio settings' : 'Open audio settings'}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? <ChevronDown size={17} /> : <SlidersHorizontal size={17} />}
        </IconButton>
      </div>

      <div className="border-t border-line px-4 py-3 sm:hidden">
        <label className="flex items-center gap-3 text-xs text-muted">
          <VolumeIcon size={16} />
          <span className="sr-only">Ambient volume</span>
          <input
            aria-label="Ambient volume mobile"
            type="range"
            min="0"
            max="100"
            value={Math.round(audio.volume * 100)}
            onChange={(event) => audio.setVolume(Number(event.target.value) / 100)}
            className="w-full accent-[var(--color-accent)]"
          />
          <span className="w-8 text-right tabular-nums">{Math.round(audio.volume * 100)}%</span>
        </label>
      </div>
    </aside>
  )
}
