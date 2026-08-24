"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDownIcon,
  PlayCircleIcon,
  ArrowLeftIcon,
} from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatDuration } from "@/lib/format";

interface SidebarLesson {
  _id: string;
  title: string | null;
  slug: string | null;
  duration: number | null;
}

interface SidebarModule {
  _key: string;
  title: string | null;
  durationSeconds: number | null;
  lessons: SidebarLesson[] | null;
}

interface SidebarCourse {
  title: string | null;
  slug: string | null;
  thumbnailLetter: string;
}

interface LessonSidebarProps {
  course: SidebarCourse;
  modules: SidebarModule[];
  currentLessonSlug: string;
  currentModuleIdx: number;
}

export function LessonSidebar({
  course,
  modules,
  currentLessonSlug,
  currentModuleIdx,
}: LessonSidebarProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set(modules[currentModuleIdx]?._key ? [modules[currentModuleIdx]._key] : [])
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleModule(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const moduleCount = modules.length;
  const currentMod = modules[currentModuleIdx];

  const moduleList = (
    <ul className="divide-y divide-canvas-line">
      {modules.map((mod, modIdx) => {
        const isActive = modIdx === currentModuleIdx;
        const isOpen = expandedKeys.has(mod._key);
        const dur = mod.durationSeconds != null && mod.durationSeconds > 0
          ? formatDuration(mod.durationSeconds)
          : null;

        return (
          <li key={mod._key}>
            <button
              onClick={() => toggleModule(mod._key)}
              aria-expanded={isOpen}
              aria-controls={`sidebar-mod-${mod._key}`}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {/* Numbered circle */}
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold ${
                  isActive
                    ? "bg-primary-500 text-white"
                    : "border border-neutral-200 text-neutral-500"
                }`}
                aria-hidden
              >
                {modIdx + 1}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-neutral-900 truncate">
                  {mod.title}
                </p>
                {dur && (
                  <p className="text-[13px] text-neutral-500 mt-0.5">{dur}</p>
                )}
              </div>

              <ChevronDownIcon
                size={16}
                className={`shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>

            {isOpen && (
              <ul id={`sidebar-mod-${mod._key}`} className="bg-neutral-50/60 border-t border-canvas-line">
                {(mod.lessons ?? []).map((lesson) => {
                  const isCurrent = lesson.slug === currentLessonSlug;
                  const dur = lesson.duration != null && lesson.duration > 0
                    ? formatDuration(lesson.duration)
                    : null;

                  return (
                    <li key={lesson._id} className="border-b border-neutral-100 last:border-b-0">
                      <Link
                        href={lesson.slug ? `/lessons/${lesson.slug}` : "#"}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`flex items-start gap-3 px-5 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                          isCurrent
                            ? "bg-primary-100/40 hover:bg-primary-100/60"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        {/* Dot marker */}
                        <span
                          className={`mt-1 shrink-0 w-2 h-2 rounded-full ${
                            isCurrent ? "bg-primary-500" : "border border-neutral-300"
                          }`}
                          aria-hidden
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] text-neutral-900 leading-snug">
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {dur && (
                              <span className="text-[13px] text-neutral-500">{dur}</span>
                            )}
                            {isCurrent && (
                              <span className="text-[13px] text-primary-500 font-medium">
                                Now playing
                              </span>
                            )}
                          </div>
                        </div>

                        {isCurrent && (
                          <PlayCircleIcon
                            size={24}
                            className="shrink-0 text-primary-500 mt-0.5"
                            aria-hidden
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile disclosure */}
      <div className="lg:hidden border-b border-canvas-line bg-canvas">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
          className="w-full flex items-center justify-between px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <span className="text-sm font-medium text-neutral-900">
            {currentMod?.title ?? "Course Content"}
          </span>
          <ChevronDownIcon
            size={16}
            className={`text-neutral-400 transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {mobileOpen && (
          <div id="mobile-sidebar" className="border-t border-canvas-line max-h-80 overflow-y-auto">
            {moduleList}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[310px] shrink-0 border-r border-canvas-line sticky top-24 max-h-[calc(100vh-96px)] overflow-y-auto bg-canvas">
        {/* Back to course */}
        <div className="px-5 pt-5 pb-3">
          <Link
            href={course.slug ? `/courses/${course.slug}` : "/courses"}
            className="inline-flex items-center gap-1.5 text-[15px] text-primary-500 hover:text-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <ArrowLeftIcon size={15} aria-hidden />
            Back to course
          </Link>
        </div>

        {/* Course row */}
        <div className="px-5 py-3 flex items-center gap-3 border-b border-canvas-line">
          <div
            className="shrink-0 w-12 h-12 rounded-md flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: "#0F172A", fontFamily: "Georgia, serif" }}
            aria-hidden
          >
            {course.thumbnailLetter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium text-neutral-900 truncate leading-tight">
              {course.title}
            </p>
            <ProgressBar value={0} showLabel={false} className="mt-1.5 w-full" />
          </div>
        </div>

        {/* Module X of Y */}
        <div className="px-5 py-3 border-b border-canvas-line flex items-center justify-between">
          <span className="text-[14px] text-neutral-900 font-medium">
            Module {currentModuleIdx + 1} of {moduleCount}
          </span>
          <ChevronDownIcon size={16} className="text-neutral-400" aria-hidden />
        </div>

        {/* Module list */}
        <div className="flex-1 overflow-y-auto">
          {moduleList}
        </div>
      </aside>
    </>
  );
}
