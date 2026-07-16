import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Navigate } from '@tanstack/react-router'
import { AuthPage } from './AuthPage'
import { isClerkConfigured } from '../model/clerkConfig'

type AuthRouteProps = {
  mode: 'sign-in' | 'sign-up'
}

export function AuthRoute({ mode }: AuthRouteProps) {
  if (!isClerkConfigured) return <AuthPage mode={mode} />

  return (
    <>
      <SignedIn>
        <Navigate to="/" replace />
      </SignedIn>
      <SignedOut>
        <AuthPage mode={mode} />
      </SignedOut>
    </>
  )
}
