import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/badge";
import { PlayIcon, PlayCircleIcon, ChevronRightIcon } from "@/components/ui/icons";
import { CourseIcon } from "./course-icon";
import { formatTimestamp } from "@/lib/format";
import type { VideoResult } from "@/lib/search/types";

function FileMetaIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function FolderMetaIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

interface VideoResultCardProps {
  result: VideoResult;
}

export function VideoResultCard({ result }: VideoResultCardProps) {
  const {
    lessonTitle,
    courseTitle,
    moduleTitle,
    label,
    reason,
    href,
    startSeconds,
    thumbnailRef,
    courseIconRef,
    duration,
  } = result;

  return (
    <Link
      href={href}
      className="block group focus:outline-none focus:ring-2 focus:ring-primary-400 rounded-xl"
    >
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:border-primary-200 transition-colors">
        {/* Thumbnail panel */}
        <div className="relative md:w-[276px] shrink-0 aspect-video md:aspect-auto md:min-h-[160px] bg-neutral-900 flex items-center justify-center">
          {thumbnailRef && (
            <Image
              src={urlFor({ _ref: thumbnailRef }).width(552).height(310).url()}
              alt={lessonTitle}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 276px"
            />
          )}
          {!thumbnailRef && (
            <PlayIcon size={48} className="text-white opacity-20" />
          )}
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform group-hover:scale-110">
              <PlayIcon size={18} className="text-white ml-1" />
            </div>
          </div>
          {/* Duration chip */}
          {duration != null && (
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-neutral-900/80 text-white text-xs font-mono tabular-nums">
              {formatTimestamp(duration)}
            </span>
          )}
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
            <Badge variant="video" className="shrink-0">
              Video
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
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 min-w-0">
              <FileMetaIcon />
              <span className="shrink-0">Lesson {label}</span>
              <span className="text-neutral-300">·</span>
              <FolderMetaIcon />
              <span className="truncate">{moduleTitle}</span>
            </div>
            <div className="flex items-center gap-1 text-primary-500 shrink-0">
              <PlayCircleIcon size={14} />
              <span className="text-sm font-medium whitespace-nowrap">
                Watch from {formatTimestamp(startSeconds)}
              </span>
              <ChevronRightIcon size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
