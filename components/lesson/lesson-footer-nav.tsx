import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { formatDuration } from "@/lib/format";

interface NavLesson {
  title: string | null;
  slug: string | null;
  duration: number | null;
}

interface LessonFooterNavProps {
  prev: NavLesson | null;
  next: NavLesson | null;
}

export function LessonFooterNav({ prev, next }: LessonFooterNavProps) {
  if (!prev && !next) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-canvas border-t border-canvas-line">
      <div className="max-w-full px-4 sm:px-6 h-[84px] flex items-center justify-between gap-4">
        {/* Previous lesson */}
        {prev ? (
          <Link
            href={prev.slug ? `/lessons/${prev.slug}` : "#"}
            className="inline-flex items-center gap-3 h-12 px-4 rounded-full border border-canvas-line text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <ArrowLeftIcon size={16} className="shrink-0 text-neutral-400" aria-hidden />
            <span className="hidden sm:flex flex-col items-start">
              <span className="text-[14px] font-medium leading-tight">{prev.title}</span>
              {prev.duration && prev.duration > 0 && (
                <span className="text-[13px] text-neutral-500">
                  {formatDuration(prev.duration)}
                </span>
              )}
            </span>
            <span className="sm:hidden text-[14px] font-medium">Previous Lesson</span>
          </Link>
        ) : (
          <div />
        )}

        {/* Next lesson */}
        {next ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex flex-col items-end">
              <span className="text-[14px] font-medium text-neutral-900 leading-tight">
                {next.title}
              </span>
              {next.duration && next.duration > 0 && (
                <span className="text-[13px] text-neutral-500">
                  {formatDuration(next.duration)}
                </span>
              )}
            </span>
            <Link
              href={next.slug ? `/lessons/${next.slug}` : "#"}
              className="inline-flex items-center gap-2 h-12 px-6 bg-primary-500 text-white rounded-full font-medium text-[15px] hover:bg-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 shrink-0"
            >
              Next Lesson
              <ArrowRightIcon size={16} aria-hidden />
            </Link>
          </div>
        ) : (
          <div />
        )}
      </div>
    </footer>
  );
}
