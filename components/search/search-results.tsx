"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import type { SearchResponse } from "@/lib/search/types";
import { VideoResultCard } from "./video-result-card";
import { LessonResultCard } from "./lesson-result-card";
import { SearchEmptyState } from "./search-empty-state";
import { ChevronDownIcon } from "@/components/ui/icons";
import { pluralize } from "@/lib/format";

const SORTS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "newest", label: "Newest" },
  { value: "duration", label: "Shortest first" },
] as const;

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col md:flex-row animate-pulse">
      <div className="md:w-[276px] shrink-0 aspect-video md:aspect-auto md:min-h-[160px] bg-neutral-200" />
      <div className="flex-1 p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 bg-neutral-200 rounded w-36" />
          <div className="h-5 bg-neutral-200 rounded w-14" />
        </div>
        <div className="h-5 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded" />
        <div className="h-4 bg-neutral-200 rounded w-2/3" />
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div className="h-3 bg-neutral-200 rounded w-44" />
          <div className="h-4 bg-neutral-200 rounded w-32" />
        </div>
      </div>
    </div>
  );
}

export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const q = (params.get("q") ?? "").trim();
  const sort = (params.get("sort") ?? "relevance") as "relevance" | "newest" | "duration";

  const [retryKey, setRetryKey] = useState(0);
  // The key for which we have settled data (resolved after fetch completes or errors)
  const [loadedFor, setLoadedFor] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const currentKey = `${q}||${sort}||${retryKey}`;
  const isLoading = q !== "" && loadedFor !== currentKey;
  const hasError = fetchError !== null && loadedFor === currentKey;

  useEffect(() => {
    if (!q) return;

    // Abort any in-flight request for a previous key
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const key = `${q}||${sort}||${retryKey}`;

    const distinctId = posthog.get_distinct_id?.() ?? undefined
    const sessionId = posthog.get_session_id?.() ?? undefined

    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, sort, distinctId, sessionId }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const json = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(json.error ?? "Search failed");
        }
        return res.json() as Promise<SearchResponse>;
      })
      .then((json) => {
        setData(json);
        setFetchError(null);
        setLoadedFor(key);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setFetchError("Something went wrong. Please try again.");
        setLoadedFor(key);
      });

    return () => {
      controller.abort();
    };
  }, [q, sort, retryKey]);

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const url = new URL(window.location.href);
    const newSort = e.target.value;
    if (newSort === "relevance") {
      url.searchParams.delete("sort");
    } else {
      url.searchParams.set("sort", newSort);
    }
    router.replace(url.pathname + url.search);
  }

  if (!q) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-neutral-500">{fetchError}</p>
        <button
          onClick={() => setRetryKey((k) => k + 1)}
          className="h-9 px-4 text-sm font-medium border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          Retry
        </button>
      </div>
    );
  }

  const results = data?.results ?? [];
  const count = data?.count ?? 0;
  const courseCount = new Set(results.map((r) => r.courseSlug)).size;

  return (
    <>
      {/* Count line */}
      {count > 0 && (
        <p className="text-sm text-neutral-500 mb-4">
          Found {count} {pluralize(count, "result")} across {courseCount}{" "}
          {pluralize(courseCount, "course")}
        </p>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <p className="text-sm font-medium text-neutral-700">
          {count} {pluralize(count, "result")}
        </p>
        <div className="relative w-40 shrink-0">
          <select
            aria-label="Sort results"
            value={sort}
            onChange={handleSortChange}
            className="h-11 w-full rounded-md border border-neutral-200 bg-white px-3 pr-8 text-sm text-neutral-900 appearance-none outline-none focus:border-primary-400 transition-colors cursor-pointer"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          />
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <SearchEmptyState />
      ) : (
        <div className="space-y-4">
          {results.map((result, i) =>
            result.kind === "video" ? (
              <VideoResultCard
                key={`${result.lessonId}-${i}`}
                result={result}
                searchQuery={q}
                searchSort={sort}
                position={i}
              />
            ) : (
              <LessonResultCard
                key={`${result.lessonId}-${i}`}
                result={result}
                searchQuery={q}
                searchSort={sort}
                position={i}
              />
            )
          )}
        </div>
      )}
    </>
  );
}
