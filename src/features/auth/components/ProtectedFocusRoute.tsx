import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import { Navigate } from '@tanstack/react-router'
import { HomePage } from '../../../routes/HomePage'
import { isClerkConfigured } from '../model/clerkConfig'

function AuthenticatedFocus() {
  const { isLoaded, user } = useUser()

  if (!isLoaded || !user) {
    return <div className="min-h-[calc(100vh-4.5rem)]" aria-label="Loading account" />
  }

  return <HomePage storageOwnerId={user.id} />
}

export function ProtectedFocusRoute() {
  if (!isClerkConfigured) return <HomePage storageOwnerId="local-preview" />

  return (
    <>
      <SignedIn>
        <AuthenticatedFocus />
      </SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  )
}
