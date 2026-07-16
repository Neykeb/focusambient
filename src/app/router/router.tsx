import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { AppShell } from '../../components/templates/AppShell'
import { AuthPage } from '../../features/auth/components/AuthPage'
import { ProtectedFocusRoute } from '../../features/auth/components/ProtectedFocusRoute'
import { ProtectedInsightsRoute } from '../../features/auth/components/ProtectedInsightsRoute'

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

const insightsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/insights',
  component: ProtectedInsightsRoute,
})

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  component: () => <AuthPage mode="sign-in" />,
})

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-up',
  component: () => <AuthPage mode="sign-up" />,
})

const routeTree = rootRoute.addChildren([indexRoute, insightsRoute, signInRoute, signUpRoute])
export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
