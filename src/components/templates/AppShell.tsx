import { useRouterState } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'
import { AudioDock } from '../../features/audio/components/AudioDock'
import { AppNavigation } from '../organisms/AppNavigation'

export function AppShell({ children }: PropsWithChildren) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isAuthRoute = pathname === '/sign-in' || pathname === '/sign-up'

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-ink">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_54%_40%,rgba(147,226,186,0.075),transparent_35%),radial-gradient(circle_at_85%_90%,rgba(89,111,255,0.045),transparent_28%)]" />

      <AppNavigation pathname={pathname} variant="desktop" />

      <div className="relative flex min-h-screen flex-col lg:pl-60">
        <AppNavigation pathname={pathname} variant="mobile" />
        {children}
        {!isAuthRoute && <AudioDock />}
      </div>
    </div>
  )
}
