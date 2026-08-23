"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";

export function PostHogIdentify() {
  const { isLoaded, isSignedIn, user } = useUser();
  const wasIdentified = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      wasIdentified.current = true;
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        username: user.username,
      });
    } else if (!isSignedIn && wasIdentified.current) {
      wasIdentified.current = false;
      posthog.reset();
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}
