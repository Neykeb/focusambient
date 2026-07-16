import { BarChart3, Headphones, Settings2, TimerReset } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'
import { AuthAccountSummary } from '../../features/auth/components/AuthAccountSummary'
import { AuthControls } from '../../features/auth/components/AuthControls'

const navigation = [
  { label: 'Focus', icon: TimerReset, to: '/' as const },
  { label: 'Insights', icon: BarChart3, to: '/insights' as const },
] as const

export function AppShell({ children }: PropsWithChildren) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-ink">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_54%_40%,rgba(147,226,186,0.075),transparent_35%),radial-gradient(circle_at_85%_90%,rgba(89,111,255,0.045),transparent_28%)]" />

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-canvas/75 px-5 py-6 backdrop-blur-xl lg:flex">
        <Link to="/" className="px-2 text-sm font-semibold tracking-[-0.03em] text-ink">
          focus<span className="text-accent">ambient</span>
        </Link>
        <nav aria-label="Main navigation" className="mt-14 space-y-1">
          {navigation.map(({ icon: Icon, label, to }) => {
            const isActive = pathname === to
            return (
              <Link
                key={label}
                to={to}
                aria-current={isActive ? 'page' : undefined}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-muted transition hover:bg-white/4 hover:text-ink aria-[current=page]:bg-white/6 aria-[current=page]:text-ink"
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
          <button type="button" disabled className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-muted opacity-45">
            <Headphones size={18} />
            Sounds
          </button>
        </nav>
        <div className="mt-auto">
          <button type="button" disabled className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-muted disabled:opacity-45">
            <Settings2 size={18} />
            Settings
          </button>
          <AuthAccountSummary />
        </div>
      </aside>

      <div className="relative flex min-h-screen flex-col lg:pl-60">
        <header className="flex min-h-18 shrink-0 items-center justify-between gap-3 border-b border-line px-4 sm:px-8 lg:border-0">
          <Link to="/" className="shrink-0 text-sm font-semibold tracking-[-0.03em] text-ink lg:hidden">
            focus<span className="text-accent">ambient</span>
          </Link>
          <nav aria-label="Mobile navigation" className="ml-auto flex items-center gap-1 lg:hidden">
            {navigation.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                aria-current={pathname === to ? 'page' : undefined}
                className="rounded-full px-2.5 py-2 text-[0.68rem] font-medium text-muted aria-[current=page]:bg-white/7 aria-[current=page]:text-ink sm:px-3 sm:text-xs"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center">
            <AuthControls />
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}
