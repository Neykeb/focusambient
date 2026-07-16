import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import { Navigate } from '@tanstack/react-router'
import { InsightsPage } from '../../../routes/InsightsPage'
import { isClerkConfigured } from '../model/clerkConfig'

function AuthenticatedInsights() {
  const { isLoaded, user } = useUser()

  if (!isLoaded || !user) {
    return <div className="min-h-[calc(100vh-4.5rem)]" aria-label="Loading account" />
  }

  return <InsightsPage storageOwnerId={user.id} />
}

export function ProtectedInsightsRoute() {
  if (!isClerkConfigured) return <InsightsPage storageOwnerId="local-preview" />

  return (
    <>
      <SignedIn>
        <AuthenticatedInsights />
      </SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  )
}
