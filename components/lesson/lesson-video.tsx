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
  courseSlug?: string;
}

export function LessonVideo({
  videoUrl,
  thumbnailUrl,
  thumbnailAlt,
  duration,
  lessonSlug,
  lessonTitle,
  courseSlug = "",
}: LessonVideoProps) {
  const searchParams = useSearchParams();
  const capturedRef = useRef(false);
  const lastCapturedKeyRef = useRef<string | null>(null);
  const completedRef = useRef(false);
  const playStartWallRef = useRef<number | null>(null);
  const depthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const rawT = searchParams.get("t");
  const startSeconds = rawT
    ? Math.max(0, Math.min(parseInt(rawT, 10) || 0, duration ?? Infinity))
    : 0;

  const parsed = videoUrl ? parseVideoUrl(videoUrl) : null;
  const videoId = parsed ? `${parsed.provider}:${parsed.id}` : null;
  const autoPlayOnLoad = startSeconds > 0 && parsed !== null;

  // "Adjust state during rendering" pattern — resets playing when lesson, timestamp,
  // or video identity changes without calling setState inside an effect.
  const [prevLessonSlug, setPrevLessonSlug] = useState(lessonSlug);
  const [prevStartSeconds, setPrevStartSeconds] = useState(startSeconds);
  const [prevVideoId, setPrevVideoId] = useState(videoId);
  const [playing, setPlaying] = useState(autoPlayOnLoad);

  if (prevLessonSlug !== lessonSlug || prevStartSeconds !== startSeconds || prevVideoId !== videoId) {
    setPrevLessonSlug(lessonSlug);
    setPrevStartSeconds(startSeconds);
    setPrevVideoId(videoId);
    setPlaying(autoPlayOnLoad);
  }

  // Stable capture helper — guarded by capturedRef so it fires at most once per video load.
  const captureVideoPlayed = useCallback(() => {
    if (capturedRef.current) return;
    capturedRef.current = true;
    posthog.capture("video_played", {
      lesson_slug: lessonSlug,
      lesson_title: lessonTitle,
      course_slug: courseSlug,
      start_seconds: startSeconds,
      provider: parsed?.provider ?? "unknown",
    });
    // Fire resume event when the learner deep-links into a specific timestamp
    // (e.g. clicking "Watch from X:XX" on a search result card)
    if (startSeconds > 0) {
      posthog.capture("lesson_resumed", {
        lesson_slug: lessonSlug,
        lesson_title: lessonTitle,
        course_slug: courseSlug,
        start_seconds: startSeconds,
        source: "deep_link",
      });
    }
  }, [lessonSlug, lessonTitle, courseSlug, startSeconds, parsed?.provider]);

  // On mount and on any lesson/timestamp navigation: reset the capture guard, then
  // fire capture if auto-play is active. Ref mutation and posthog.capture are both
  // safe in effects; no setState here.
  useEffect(() => {
    const key = `${lessonSlug}:${videoId ?? ""}:${startSeconds}`;
    capturedRef.current = false;
    completedRef.current = false;
    if (autoPlayOnLoad && lastCapturedKeyRef.current !== key) {
      lastCapturedKeyRef.current = key;
      captureVideoPlayed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonSlug, startSeconds, videoId]);

  // Wall-clock watch-depth heuristic: when the player is visible and playing,
  // accumulate elapsed time against the lesson duration. At 95% → lesson_completed.
  // Inaccurate when the learner pauses, seeks, or changes speed (no player API).
  useEffect(() => {
    if (!playing || !duration || duration <= 0) {
      if (depthIntervalRef.current) {
        clearInterval(depthIntervalRef.current);
        depthIntervalRef.current = null;
      }
      return;
    }

    playStartWallRef.current = Date.now();

    depthIntervalRef.current = setInterval(() => {
      if (!playStartWallRef.current || document.visibilityState !== "visible") return;
      if (completedRef.current) {
        clearInterval(depthIntervalRef.current!);
        depthIntervalRef.current = null;
        return;
      }
      const elapsed = (Date.now() - playStartWallRef.current) / 1000;
      const watchedSeconds = elapsed + startSeconds;
      if (watchedSeconds / duration >= 0.95) {
        completedRef.current = true;
        posthog.capture("lesson_completed", {
          lesson_slug: lessonSlug,
          lesson_title: lessonTitle,
          course_slug: courseSlug,
          duration_seconds: duration,
          source: "video_watch_depth",
          measurement: "elapsed_time",
        });
        clearInterval(depthIntervalRef.current!);
        depthIntervalRef.current = null;
      }
    }, 5000);

    return () => {
      if (depthIntervalRef.current) {
        clearInterval(depthIntervalRef.current);
        depthIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

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
