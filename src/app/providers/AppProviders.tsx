import { ClerkProvider } from '@clerk/clerk-react'
import { clerkPublishableKey } from '../../features/auth/model/clerkConfig'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type PropsWithChildren } from 'react'

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  )

  const app = (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  if (!clerkPublishableKey) return app

  return <ClerkProvider publishableKey={clerkPublishableKey}>{app}</ClerkProvider>
}
