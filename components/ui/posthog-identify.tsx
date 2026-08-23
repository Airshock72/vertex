"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";

/**
 * Identifies the signed-in Clerk user in PostHog so that client-side events
 * are linked to the authenticated person. Renders nothing.
 */
export function PostHogIdentify() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      // Use the Clerk user ID as the stable distinct ID
      posthog.identify(user.id, {
        // PII goes on the person profile via identify(), never in capture() properties
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        username: user.username,
      });
    } else if (!isSignedIn) {
      // If the user signed out reset so their history isn't inherited by the next visitor
      posthog.reset();
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}
