import { SignIn, SignUp } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'
import { isClerkConfigured } from '../model/clerkConfig'

type AuthPageProps = {
  mode: 'sign-in' | 'sign-up'
}

const clerkAppearance = {
  variables: {
    colorPrimary: '#93e2ba',
    colorBackground: '#131614',
    colorInputBackground: '#1a1e1b',
    colorInputText: '#f4f7f5',
    colorText: '#f4f7f5',
    colorTextSecondary: '#9da6a0',
    borderRadius: '0.9rem',
  },
  elements: {
    cardBox: 'shadow-none',
    card: 'border border-white/10 shadow-2xl shadow-black/35',
    footerActionLink: 'text-[#93e2ba] hover:text-[#b7f0d2]',
    formButtonPrimary: 'text-[#101411] hover:bg-[#b7f0d2]',
    socialButtonsBlockButton: 'border-white/10 text-white hover:bg-white/5',
  },
} as const

export function AuthPage({ mode }: AuthPageProps) {
  if (!isClerkConfigured) {
    return (
      <main className="grid min-h-[calc(100vh-4.5rem)] place-items-center px-5 py-12 text-center">
        <div className="max-w-md rounded-3xl border border-line bg-elevated/70 p-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Development setup</p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Clerk is not configured yet</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Add your publishable Clerk key to <code>.env.local</code>. The local preview remains available meanwhile.
          </p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-[#101411]">
            Open local preview
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="grid min-h-[calc(100vh-4.5rem)] place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">Your quiet space</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-muted">Continue with your email address or Google.</p>
        </div>
        {mode === 'sign-in' ? (
          <SignIn routing="hash" signUpUrl="/sign-up" fallbackRedirectUrl="/" appearance={clerkAppearance} />
        ) : (
          <SignUp routing="hash" signInUrl="/sign-in" fallbackRedirectUrl="/" appearance={clerkAppearance} />
        )}
      </div>
    </main>
  )
}
