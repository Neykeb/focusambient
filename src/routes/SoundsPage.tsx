import { Music2 } from 'lucide-react'
import { soundscapes } from '../features/audio/model/soundscapes'

export function SoundsPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-10rem)] w-full max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
      <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">Sound library</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Choose your atmosphere</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Use the persistent audio bar below to play, pause, switch sounds and adjust the volume.</p>

      <section aria-label="Available ambient sounds" className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {soundscapes.map((soundscape) => {
          const Icon = soundscape.icon ?? Music2
          return (
            <article key={soundscape.id} className="rounded-2xl border border-line bg-elevated/65 p-5">
              <div className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent"><Icon size={19} /></div>
              <h2 className="mt-5 text-sm font-medium text-ink">{soundscape.label}</h2>
              <p className="mt-2 text-xs leading-5 text-muted">{soundscape.description}</p>
              <p className="mt-4 text-[0.68rem] font-medium text-muted uppercase tracking-wider">{soundscape.source === 'file' ? 'Audio file' : 'Generated locally'}</p>
            </article>
          )
        })}
      </section>
    </main>
  )
}
