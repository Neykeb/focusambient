import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import { Navigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { isClerkConfigured } from '../model/clerkConfig'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isClerkConfigured) return children

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  )
}

type ProtectedUserRouteProps = {
  children: (storageOwnerId: string) => ReactNode
}

function AuthenticatedUserRoute({ children }: ProtectedUserRouteProps) {
  const { isLoaded, user } = useUser()

  if (!isLoaded || !user) {
    return (
      <div
        className="min-h-[calc(100vh-4.5rem)]"
        aria-label="Loading account"
      />
    )
  }

  return children(user.id)
}

export function ProtectedUserRoute({ children }: ProtectedUserRouteProps) {
  if (!isClerkConfigured) return children('local-preview')

  return (
    <>
      <SignedIn>
        <AuthenticatedUserRoute>{children}</AuthenticatedUserRoute>
      </SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  )
}
