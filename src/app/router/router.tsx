import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { AppShell } from '../../components/templates/AppShell'
import { AuthRoute } from '../../features/auth/components/AuthRoute'
import { ProtectedFocusRoute } from '../../features/auth/components/ProtectedFocusRoute'
import { ProtectedInsightsRoute } from '../../features/auth/components/ProtectedInsightsRoute'
import { ProtectedSettingsRoute } from '../../features/auth/components/ProtectedSettingsRoute'
import { ProtectedSoundsRoute } from '../../features/auth/components/ProtectedSoundsRoute'

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ProtectedFocusRoute,
})

const soundsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sounds',
  component: ProtectedSoundsRoute,
})

const insightsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/insights',
  component: ProtectedInsightsRoute,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: ProtectedSettingsRoute,
})

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  component: () => <AuthRoute mode="sign-in" />,
})

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-up',
  component: () => <AuthRoute mode="sign-up" />,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  soundsRoute,
  insightsRoute,
  settingsRoute,
  signInRoute,
  signUpRoute,
])
export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
