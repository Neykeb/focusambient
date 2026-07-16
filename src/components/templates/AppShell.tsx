import { BarChart3, Headphones, Settings2, TimerReset } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'
import { AudioDock } from '../../features/audio/components/AudioDock'
import { AuthAccountSummary } from '../../features/auth/components/AuthAccountSummary'
import { AuthControls } from '../../features/auth/components/AuthControls'

const navigation = [
  { label: 'Focus', icon: TimerReset, to: '/' as const },
  { label: 'Sounds', icon: Headphones, to: '/sounds' as const },
  { label: 'Insights', icon: BarChart3, to: '/insights' as const },
] as const

export function AppShell({ children }: PropsWithChildren) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isAuthRoute = pathname === '/sign-in' || pathname === '/sign-up'

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-ink">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_54%_40%,rgba(147,226,186,0.075),transparent_35%),radial-gradient(circle_at_85%_90%,rgba(89,111,255,0.045),transparent_28%)]" />

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-canvas/75 px-5 py-6 backdrop-blur-xl lg:flex">
        <Link to="/" className="px-2 text-sm font-semibold tracking-[-0.03em] text-ink">
          focus<span className="text-accent">ambient</span>
        </Link>
        <nav aria-label="Main navigation" className="mt-14 space-y-1">
          {navigation.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              aria-current={pathname === to ? 'page' : undefined}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-muted transition hover:bg-white/4 hover:text-ink aria-[current=page]:bg-white/6 aria-[current=page]:text-ink"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Link
            to="/settings"
            aria-current={pathname === '/settings' ? 'page' : undefined}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-muted transition hover:bg-white/4 hover:text-ink aria-[current=page]:bg-white/6 aria-[current=page]:text-ink"
          >
            <Settings2 size={18} />
            Settings
          </Link>
          <AuthAccountSummary />
        </div>
      </aside>

      <div className="relative flex min-h-screen flex-col lg:pl-60">
        <header className="flex min-h-18 shrink-0 items-center justify-between gap-2 border-b border-line px-3 sm:px-8 lg:border-0">
          <Link to="/" className="shrink-0 text-xs font-semibold tracking-[-0.03em] text-ink sm:text-sm lg:hidden">
            focus<span className="text-accent">ambient</span>
          </Link>
          <nav aria-label="Mobile navigation" className="ml-auto flex items-center gap-0.5 lg:hidden">
            {navigation.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                aria-current={pathname === to ? 'page' : undefined}
                className="rounded-full px-2 py-2 text-[0.62rem] font-medium text-muted aria-[current=page]:bg-white/7 aria-[current=page]:text-ink sm:px-3 sm:text-xs"
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
        {!isAuthRoute && <AudioDock />}
      </div>
    </div>
  )
}
