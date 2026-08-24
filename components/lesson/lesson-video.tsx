"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PlayIcon } from "@/components/ui/icons";
import { parseVideoUrl } from "@/lib/video";

interface LessonVideoProps {
  videoUrl: string | null;
  thumbnailUrl: string | null;
  thumbnailAlt: string;
  duration: number | null;
  lessonSlug: string;
  lessonTitle: string;
}

export function LessonVideo({
  videoUrl,
  thumbnailUrl,
  thumbnailAlt,
  duration,
  lessonSlug,
  lessonTitle,
}: LessonVideoProps) {
  const searchParams = useSearchParams();
  const capturedRef = useRef(false);

  const rawT = searchParams.get("t");
  const startSeconds = rawT
    ? Math.max(0, Math.min(parseInt(rawT, 10) || 0, duration ?? Infinity))
    : 0;

  const autoPlayOnLoad = startSeconds > 0;
  // Seed from URL so the embed loads immediately without needing a setState in an effect.
  const [playing, setPlaying] = useState(autoPlayOnLoad);
  const parsed = videoUrl ? parseVideoUrl(videoUrl) : null;

  // Stable capture helper — guarded by capturedRef so it fires at most once.
  const captureVideoPlayed = useCallback(() => {
    if (capturedRef.current) return;
    capturedRef.current = true;
    posthog.capture("video_played", {
      lesson_slug: lessonSlug,
      lesson_title: lessonTitle,
      start_seconds: startSeconds,
      provider: parsed?.provider ?? "unknown",
    });
  }, [lessonSlug, lessonTitle, startSeconds, parsed?.provider]);

  // Fire capture on mount when the URL carries a timestamp (auto-play path).
  // setState is not called here — playing is seeded from useState below.
  useEffect(() => {
    if (autoPlayOnLoad) captureVideoPlayed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePlay() {
    captureVideoPlayed();
    setPlaying(true);
  }

  const embedUrl = parsed?.embedUrl(startSeconds, true) ?? null;

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-neutral-900" style={{ aspectRatio: "16/9" }}>
      {playing && embedUrl ? (
        <iframe
          src={embedUrl}
          title={lessonTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <>
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={thumbnailAlt}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-900" />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {parsed ? (
            <button
              onClick={handlePlay}
              aria-label="Play video"
              className="absolute inset-0 flex items-center justify-center group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <span className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-lg group-hover:bg-primary-400 transition-colors">
                <PlayIcon size={28} />
              </span>
            </button>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-md">
                Video unavailable
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
