import { UserProfile } from '@clerk/clerk-react'
import { isClerkConfigured } from '../features/auth/model/clerkConfig'

const appearance = {
  variables: {
    colorPrimary: '#93e2ba',
    colorBackground: '#131614',
    colorInputBackground: '#1a1e1b',
    colorInputText: '#f4f7f5',
    colorText: '#f4f7f5',
    colorTextSecondary: '#9da6a0',
    borderRadius: '0.9rem',
  },
} as const

export function SettingsPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-10rem)] w-full max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
      <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">Account</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Settings</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Manage your profile, email addresses, connected Google account and account security.</p>

      <div className="mt-10 overflow-x-auto">
        {isClerkConfigured ? (
          <UserProfile routing="hash" appearance={appearance} />
        ) : (
          <div className="rounded-2xl border border-line bg-elevated/65 p-6 text-sm text-muted">Account settings are available after Clerk is configured.</div>
        )}
      </div>
    </main>
  )
}
