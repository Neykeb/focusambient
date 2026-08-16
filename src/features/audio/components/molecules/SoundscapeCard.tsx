import type { Soundscape } from '../../model/soundscapes'

type SoundscapeCardProps = {
  soundscape: Soundscape
}

export function SoundscapeCard({ soundscape }: SoundscapeCardProps) {
  const Icon = soundscape.icon

  return (
    <article className="rounded-2xl border border-line bg-elevated/65 p-5">
      <div className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
        <Icon size={19} />
      </div>
      <h2 className="mt-5 text-sm font-medium text-ink">{soundscape.label}</h2>
      <p className="mt-2 text-xs leading-5 text-muted">{soundscape.description}</p>
      <p className="mt-4 text-[0.68rem] font-medium tracking-wider text-muted uppercase">
        Local audio file
      </p>
    </article>
  )
}
