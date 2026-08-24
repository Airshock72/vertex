"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

interface LessonPageTrackerProps {
  lessonSlug: string;
  lessonTitle: string;
  courseSlug: string;
  courseTitle: string;
  lessonLabel: string;
}

export function LessonPageTracker({
  lessonSlug,
  lessonTitle,
  courseSlug,
  courseTitle,
  lessonLabel,
}: LessonPageTrackerProps) {
  useEffect(() => {
    posthog.capture("lesson_viewed", {
      lesson_slug: lessonSlug,
      lesson_title: lessonTitle,
      lesson_label: lessonLabel,
      course_slug: courseSlug,
      course_title: courseTitle,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
