import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Navigate } from '@tanstack/react-router'
import { SettingsPage } from '../../../routes/SettingsPage'
import { isClerkConfigured } from '../model/clerkConfig'

export function ProtectedSettingsRoute() {
  if (!isClerkConfigured) return <SettingsPage />

  return (
    <>
      <SignedIn><SettingsPage /></SignedIn>
      <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
    </>
  )
}
