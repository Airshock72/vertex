"use client";

import { useState, useRef, useCallback } from "react";
import posthog from "posthog-js";

interface LessonTabsProps {
  lessonContent: React.ReactNode;
  lessonSlug: string;
}

const TABS = [
  { id: "content", label: "Lesson Content" },
  { id: "notes", label: "Notes" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function LessonTabs({ lessonContent, lessonSlug }: LessonTabsProps) {
  const [active, setActive] = useState<TabId>("content");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = useCallback(
    (id: TabId) => {
      setActive(id);
      posthog.capture("lesson_tab_changed", {
        lesson_slug: lessonSlug,
        tab: id,
      });
    },
    [lessonSlug]
  );

  function handleKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowRight") {
      const next = (idx + 1) % TABS.length;
      tabRefs.current[next]?.focus();
      handleSelect(TABS[next].id);
    } else if (e.key === "ArrowLeft") {
      const prev = (idx - 1 + TABS.length) % TABS.length;
      tabRefs.current[prev]?.focus();
      handleSelect(TABS[prev].id);
    }
  }

  return (
    <div>
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Lesson sections"
        className="flex border-b border-canvas-line mb-6"
      >
        {TABS.map((tab, idx) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              ref={(el) => { tabRefs.current[idx] = el; }}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleSelect(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`px-1 pb-3 mr-6 text-[15px] font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                isActive
                  ? "border-primary-500 text-primary-500"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div
        role="tabpanel"
        id="tabpanel-content"
        aria-labelledby="tab-content"
        hidden={active !== "content"}
      >
        {lessonContent}
      </div>

      <div
        role="tabpanel"
        id="tabpanel-notes"
        aria-labelledby="tab-notes"
        hidden={active !== "notes"}
      >
        <div className="py-10 flex flex-col items-center text-center text-neutral-500">
          <p className="text-sm">Your notes will live here soon.</p>
        </div>
      </div>
    </div>
  );
}
