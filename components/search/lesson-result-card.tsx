import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon, ChevronRightIcon, ExternalLinkIcon } from "@/components/ui/icons";
import { CourseIcon } from "./course-icon";
import type { LessonResult } from "@/lib/search/types";

function KeyPointsFileIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-neutral-300 shrink-0"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

interface LessonResultCardProps {
  result: LessonResult;
}

export function LessonResultCard({ result }: LessonResultCardProps) {
  const { lessonTitle, courseTitle, label, keyPoints, reason, href, courseIconRef } = result;

  const moduleNumber = label.split(".")[0];
  const displayPoints = keyPoints.slice(0, 3);

  return (
    <Link
      href={href}
      className="block group focus:outline-none focus:ring-2 focus:ring-primary-400 rounded-xl"
    >
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:border-primary-200 transition-colors">
        {/* Key points panel */}
        <div className="relative md:w-[276px] shrink-0 bg-neutral-100 p-5 flex flex-col min-h-[160px]">
          <KeyPointsFileIcon />
          <ul className="mt-3 space-y-2 flex-1">
            {displayPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                <span className="mt-[5px] shrink-0 w-1.5 h-1.5 rounded-full bg-neutral-500" />
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
          {/* Presentational check circle — will reflect real progress when tracking lands */}
          <div className="mt-4 flex justify-end">
            <CheckCircleIcon size={20} className="text-primary-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col gap-2 min-w-0">
          {/* Course row + badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <CourseIcon
                courseTitle={courseTitle}
                courseIconRef={courseIconRef}
                size={20}
              />
              <span className="text-sm text-neutral-500 truncate">{courseTitle}</span>
            </div>
            <Badge variant="lesson" className="shrink-0">
              Lesson
            </Badge>
          </div>

          {/* Lesson title */}
          <h3
            className="text-lg font-bold text-neutral-900 leading-snug"
            style={{ fontFamily: "var(--font-playfair-display)" }}
          >
            {lessonTitle}
          </h3>

          {/* Reason */}
          <p className="text-sm text-neutral-500 leading-relaxed flex-1 line-clamp-2">
            {reason}
          </p>

          {/* Meta row */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100 gap-3">
            <span className="text-xs text-neutral-500">Module {moduleNumber}</span>
            <div className="flex items-center gap-1 text-primary-500 shrink-0">
              <span className="text-sm font-medium">View lesson</span>
              <ExternalLinkIcon size={13} />
              <ChevronRightIcon size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
