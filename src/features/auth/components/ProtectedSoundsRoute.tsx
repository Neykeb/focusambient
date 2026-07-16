import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Navigate } from '@tanstack/react-router'
import { SoundsPage } from '../../../routes/SoundsPage'
import { isClerkConfigured } from '../model/clerkConfig'

export function ProtectedSoundsRoute() {
  if (!isClerkConfigured) return <SoundsPage />

  return (
    <>
      <SignedIn><SoundsPage /></SignedIn>
      <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
    </>
  )
}
