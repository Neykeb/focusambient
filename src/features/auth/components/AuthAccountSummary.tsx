import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import { isClerkConfigured } from '../model/clerkConfig'

function SignedInAccountSummary() {
  const { user } = useUser()
  const label = user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? 'Your account'
  const initials = user?.firstName?.slice(0, 2) ?? user?.primaryEmailAddress?.emailAddress.slice(0, 2) ?? 'FA'

  return (
    <div className="mt-4 flex items-center gap-3 border-t border-line px-2 pt-5">
      <div className="grid size-9 place-items-center rounded-full bg-white/7 text-xs font-semibold text-muted uppercase">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-ink">{label}</p>
        <p className="text-[0.68rem] text-muted">Signed in</p>
      </div>
    </div>
  )
}

function PreviewAccountSummary() {
  return (
    <div className="mt-4 flex items-center gap-3 border-t border-line px-2 pt-5">
      <div className="grid size-9 place-items-center rounded-full bg-white/7 text-xs font-semibold text-muted">FA</div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-ink">Your space</p>
        <p className="text-[0.68rem] text-muted">Local preview</p>
      </div>
    </div>
  )
}

export function AuthAccountSummary() {
  if (!isClerkConfigured) return <PreviewAccountSummary />

  return (
    <>
      <SignedIn>
        <SignedInAccountSummary />
      </SignedIn>
      <SignedOut>
        <div className="mt-4 border-t border-line px-2 pt-5">
          <p className="text-xs font-medium text-ink">Private focus space</p>
          <p className="mt-1 text-[0.68rem] text-muted">Sign in required</p>
        </div>
      </SignedOut>
    </>
  )
}
