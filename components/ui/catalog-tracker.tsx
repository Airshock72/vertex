"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export function CatalogViewTracker({ courseCount }: { courseCount: number }) {
  useEffect(() => {
    posthog.capture("catalog_viewed", { course_count: courseCount });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
