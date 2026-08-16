import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { AppShell } from '../../components/templates/AppShell'
import { AuthRoute } from '../../features/auth/components/AuthRoute'
import {
  FocusRoute,
  InsightsRoute,
  SettingsRoute,
  SoundsRoute,
} from '../../features/auth/components/ProtectedPages'

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
  component: FocusRoute,
})

const soundsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sounds',
  component: SoundsRoute,
})

const insightsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/insights',
  component: InsightsRoute,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsRoute,
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
export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
