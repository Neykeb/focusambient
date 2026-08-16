import { ClerkProvider } from '@clerk/clerk-react'
import { clerkPublishableKey } from '../../features/auth/model/clerkConfig'
import type { PropsWithChildren } from 'react'

export function AppProviders({ children }: PropsWithChildren) {
  if (!clerkPublishableKey) return children

  return <ClerkProvider publishableKey={clerkPublishableKey}>{children}</ClerkProvider>
}
