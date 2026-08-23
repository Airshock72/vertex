"use client";

import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import posthog from "posthog-js";

export function NavbarAuth() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return <UserButton />;
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton>
        <button
          onClick={() => posthog.capture("sign_in_clicked")}
          className="h-9 px-4 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          Sign in
        </button>
      </SignInButton>
      <SignUpButton>
        <button
          onClick={() => posthog.capture("sign_up_clicked")}
          className="h-9 px-4 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
        >
          Sign up
        </button>
      </SignUpButton>
    </div>
  );
}
