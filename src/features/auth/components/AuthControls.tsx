import { SignedIn, SignedOut, UserButton, useClerk } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { isClerkConfigured } from "../model/clerkConfig";

const signInClassName =
  "rounded-full border border-line bg-elevated px-4 py-2 text-xs font-medium text-ink transition hover:border-white/20 hover:bg-white/7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  function SignedInControls() {
    const { signOut } = useClerk();
    
    return (
      <div className="flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-9 ring-1 ring-white/15",
            },
          }}
        />

        <button
          type="button"
          onClick={() => void signOut()}
          className={signInClassName}
        >
          Sign out
        </button>
      </div>
    );
  }

export function AuthControls() {
  if (!isClerkConfigured) {
    return (
      <Link to="/sign-in" className={signInClassName}>
        Sign in
      </Link>
    );
  }

  return (
    <>
      <SignedOut>
        <Link to="/sign-in" className={signInClassName}>
          Sign in
        </Link>
      </SignedOut>
      <SignedIn>
        <SignedInControls />
      </SignedIn>
    </>
  );
}
