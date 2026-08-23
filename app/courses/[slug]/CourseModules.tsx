"use client";

import { useState, useEffect } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import posthog from "posthog-js";

interface TrackerProps {
  courseSlug?: string;
  courseTitle?: string;
  moduleCount: number;
}

export function CoursePageTracker({ courseSlug, courseTitle, moduleCount }: TrackerProps) {
  useEffect(() => {
    posthog.capture("course_viewed", {
      course_slug: courseSlug,
      course_title: courseTitle,
      module_count: moduleCount,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

type LessonData = {
  _id: string;
  title: string | null;
  slug: string | null;
  duration: number | null;
  freePreview: boolean | null;
};

type ModuleData = {
  _key: string;
  title: string | null;
  summary: string | null;
  lessons: LessonData[] | null;
};

interface Props {
  modules: ModuleData[];
  courseSlug?: string;
  courseTitle?: string;
}

function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const SHOW_INITIAL = 6;

export default function CourseModules({ modules, courseSlug, courseTitle }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? modules : modules.slice(0, SHOW_INITIAL);
  const hasMore = modules.length > SHOW_INITIAL;

  function toggle(key: string, modTitle: string | null) {
    const isOpening = !expanded.has(key);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    if (isOpening) {
      posthog.capture("module_expanded", {
        course_slug: courseSlug,
        course_title: courseTitle,
        module_title: modTitle,
      });
    }
  }

  return (
    <div>
      <div className="rounded-2xl border border-canvas-line overflow-hidden">
        {visible.map((mod, modIdx) => {
          const hasLessons = (mod.lessons?.length ?? 0) > 0;
          const isOpen = hasLessons && expanded.has(mod._key);
          const seconds =
            mod.lessons?.reduce((s, l) => s + (l.duration ?? 0), 0) ?? 0;
          const duration = seconds > 0 ? formatDuration(seconds) : null;

          const rowMeta = (
            <>
              <span className="shrink-0 w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-sm text-neutral-500 font-medium">
                {modIdx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900">
                  {mod.title}
                </p>
                {mod.summary && (
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                    {mod.summary}
                  </p>
                )}
              </div>
              {duration && (
                <span className="shrink-0 text-sm text-neutral-500">
                  {duration}
                </span>
              )}
            </>
          );

          return (
            <div
              key={mod._key}
              className="border-b border-canvas-line last:border-b-0"
            >
              {hasLessons ? (
                <button
                  onClick={() => toggle(mod._key, mod.title)}
                  aria-expanded={isOpen}
                  aria-controls={`mod-${mod._key}`}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors text-left"
                >
                  {rowMeta}
                  <ChevronDownIcon
                    size={16}
                    className={`shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
              ) : (
                <div className="flex items-center gap-4 px-6 py-4 cursor-default">
                  {rowMeta}
                </div>
              )}

              {isOpen && (
                <ul
                  id={`mod-${mod._key}`}
                  className="border-t border-canvas-line"
                >
                  {mod.lessons!.map((lesson, lesIdx) => {
                    const lessonContent = (
                      <>
                        <span className="shrink-0 w-8 text-right text-xs text-neutral-400">
                          {modIdx + 1}.{lesIdx + 1}
                        </span>
                        <span className="flex-1 text-sm text-neutral-700">
                          {lesson.title}
                        </span>
                        {lesson.freePreview && (
                          <span className="shrink-0 text-[10px] font-semibold tracking-wider uppercase text-primary-500 bg-primary-100 px-2 py-0.5 rounded">
                            Free
                          </span>
                        )}
                        {lesson.duration && lesson.duration > 0 && (
                          <span className="shrink-0 text-xs text-neutral-400">
                            {formatDuration(lesson.duration)}
                          </span>
                        )}
                      </>
                    );

                    return (
                      <li
                        key={lesson._id}
                        className="border-b border-neutral-100 last:border-b-0"
                      >
                        {lesson.slug ? (
                          <a
                            href={`/lessons/${lesson.slug}`}
                            className="flex items-center gap-4 px-6 py-3 bg-neutral-50/60 hover:bg-neutral-100 transition-colors"
                            onClick={() =>
                              posthog.capture("lesson_clicked", {
                                course_slug: courseSlug,
                                course_title: courseTitle,
                                module_title: mod.title,
                                lesson_title: lesson.title,
                                lesson_slug: lesson.slug,
                                lesson_index: `${modIdx + 1}.${lesIdx + 1}`,
                                free_preview: lesson.freePreview ?? false,
                              })
                            }
                          >
                            {lessonContent}
                          </a>
                        ) : (
                          <div
                            className="flex items-center gap-4 px-6 py-3 bg-neutral-50/60 opacity-50 cursor-default select-none"
                            aria-disabled="true"
                          >
                            {lessonContent}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-8 h-11 rounded-full border border-canvas-line bg-canvas text-sm text-neutral-700 hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {showAll
              ? "Show fewer modules"
              : `Show all ${modules.length} modules`}
            <ChevronDownIcon
              size={14}
              className={`transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </div>
      )}
    </div>
  );
}
