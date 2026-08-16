import { soundscapes } from '../features/audio/model/soundscapes'
import { SoundscapeCard } from '../features/audio/components/molecules/SoundscapeCard'

export function SoundsPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-10rem)] w-full max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
      <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">Sound library</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Choose your atmosphere</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Use the persistent audio bar below to play, pause, switch sounds and adjust the volume.</p>

      <section aria-label="Available ambient sounds" className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {soundscapes.map((soundscape) => (
          <SoundscapeCard key={soundscape.id} soundscape={soundscape} />
        ))}
      </section>
    </main>
  )
}
