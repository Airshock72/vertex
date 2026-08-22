import { type ReactNode } from "react";
import { Badge } from "./badge";
import { BarChartIcon, ClockIcon, ExternalLinkIcon, FileIcon, LayersIcon, PlayCircleIcon } from "./icons";

/* ── Course Card ─────────────────────────────────────────── */

interface CourseCardProps {
  iconLabel: string;
  iconBg?: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  modules: number;
  className?: string;
}

export function CourseCard({
  iconLabel,
  iconBg = "#0F172A",
  title,
  description,
  level,
  duration,
  modules,
  className = "",
}: CourseCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col gap-4 ${className}`}>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {iconLabel}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-neutral-900 leading-snug">{title}</h3>
        <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <BarChartIcon size={12} />
          {level}
        </span>
        <span className="flex items-center gap-1">
          <ClockIcon size={12} />
          {duration}
        </span>
        <span className="flex items-center gap-1">
          <LayersIcon size={12} />
          {modules} modules
        </span>
      </div>
    </div>
  );
}

/* ── Lesson Card ─────────────────────────────────────────── */

interface LessonCardVideoProps {
  title: string;
  description: string;
  lessonRef: string;
  duration: string;
  watchFrom?: string;
  className?: string;
}

export function LessonCardVideo({
  title,
  description,
  lessonRef,
  duration,
  watchFrom,
  className = "",
}: LessonCardVideoProps) {
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col gap-3 ${className}`}>
      <Badge variant="video">Video</Badge>
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 leading-snug">{title}</h3>
        <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-neutral-100">
        <span className="text-xs text-neutral-500">
          {lessonRef} · {duration}
        </span>
        {watchFrom && (
          <button className="inline-flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-400 transition-colors">
            <PlayCircleIcon size={14} />
            Watch from {watchFrom}
          </button>
        )}
      </div>
    </div>
  );
}

interface LessonCardReadingProps {
  title: string;
  description: string;
  moduleRef: string;
  className?: string;
}

export function LessonCardReading({
  title,
  description,
  moduleRef,
  className = "",
}: LessonCardReadingProps) {
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col gap-3 ${className}`}>
      <Badge variant="lesson">Lesson</Badge>
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 leading-snug">{title}</h3>
        <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-neutral-100">
        <span className="text-xs text-neutral-500">{moduleRef}</span>
        <button className="inline-flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-400 transition-colors">
          View lesson
          <ExternalLinkIcon size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── Resource Card ───────────────────────────────────────── */

interface ResourceCardProps {
  title: string;
  description: string;
  type: string;
  size: string;
  className?: string;
}

export function ResourceCard({
  title,
  description,
  type,
  size,
  className = "",
}: ResourceCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex gap-4 ${className}`}>
      <div className="shrink-0 w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500">
        <FileIcon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-neutral-900 leading-snug">{title}</h3>
        <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-neutral-400">
            {type} · {size}
          </span>
          <button className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <ExternalLinkIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Generic Card shell ──────────────────────────────────── */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
