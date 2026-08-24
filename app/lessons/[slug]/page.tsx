import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { cache } from "react";

import { sanityFetch } from "@/sanity/lib/fetch";
import { LESSON_BY_SLUG_QUERY, LESSON_SLUGS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type {
  LESSON_BY_SLUG_QUERY_RESULT,
  LESSON_SLUGS_QUERY_RESULT,
} from "@/sanity.types";

import { Navbar, Breadcrumbs } from "@/components/ui/navigation";
import { NavbarAuth } from "@/components/ui/navbar-auth";
import { Badge } from "@/components/ui/badge";
import {
  BellIcon,
  BarChartIcon,
  ClockIcon,
  UsersIcon,
  BookmarkIcon,
} from "@/components/ui/icons";
import { LessonSidebar } from "@/components/lesson/lesson-sidebar";
import { LessonVideo } from "@/components/lesson/lesson-video";
import { LessonTabs } from "@/components/lesson/lesson-tabs";
import { LessonNotes } from "@/components/lesson/lesson-notes";
import { LessonKeyPoints } from "@/components/lesson/lesson-key-points";
import { LessonResources } from "@/components/lesson/lesson-resources";
import { LessonFooterNav } from "@/components/lesson/lesson-footer-nav";
import { LessonPageTracker } from "./LessonTracker";

import { formatDuration, formatCount, formatLevel } from "@/lib/format";

/* ── Data fetching ───────────────────────────────────────── */

type Props = { params: Promise<{ slug: string }> };

const getLesson = cache(async (slug: string) => {
  const result = await sanityFetch({
    query: LESSON_BY_SLUG_QUERY,
    params: { slug },
    tags: ["lesson", "course"],
  });
  return result as unknown as LESSON_BY_SLUG_QUERY_RESULT;
});

export async function generateStaticParams() {
  const slugs = (await sanityFetch({
    query: LESSON_SLUGS_QUERY,
    tags: ["lesson"],
  })) as unknown as LESSON_SLUGS_QUERY_RESULT;

  return slugs
    .filter((l): l is { slug: string } => l.slug !== null)
    .map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson) return {};

  // Extract first plain-text paragraph as description
  const firstBlock = lesson.notes?.find((b) => b._type === "block");
  const description =
    firstBlock && "children" in firstBlock
      ? (firstBlock.children as { text?: string }[])
          .map((c) => c.text ?? "")
          .join("")
      : "";

  return {
    title: lesson.title ?? "Lesson",
    description: description.slice(0, 160),
  };
}

/* ── Helpers ─────────────────────────────────────────────── */

type NotesBlock = { _type: string; _key: string; [key: string]: unknown };

function splitLeadParagraph(notes: NotesBlock[] | null): {
  summary: string;
  bodyBlocks: NotesBlock[];
} {
  if (!notes || notes.length === 0) return { summary: "", bodyBlocks: [] };
  const [first, ...rest] = notes;
  if (first._type !== "block") return { summary: "", bodyBlocks: notes };
  const text = ((first as { children?: { text?: string }[] }).children ?? [])
    .map((c) => c.text ?? "")
    .join("");
  return { summary: text, bodyBlocks: rest };
}

/* ── Page ────────────────────────────────────────────────── */

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson) notFound();

  const course = lesson.course;
  const modules = course?.modules ?? [];

  // Derive curriculum context
  type FlatLesson = {
    _id: string;
    title: string | null;
    slug: string | null;
    duration: number | null;
    modIdx: number;
    lesIdx: number;
    modTitle: string | null;
  };
  const allLessons: FlatLesson[] = modules.flatMap((mod, modIdx) =>
    (mod.lessons ?? []).map((les, lesIdx) => ({
      ...les,
      modIdx,
      lesIdx,
      modTitle: mod.title,
    }))
  );

  const currentIdx = allLessons.findIndex((l) => l.slug === lesson.slug);
  const currentFlat = currentIdx >= 0 ? allLessons[currentIdx] : null;
  const moduleIdx = currentFlat?.modIdx ?? 0;
  const lessonIdxInMod = currentFlat?.lesIdx ?? 0;
  const lessonLabel = `Lesson ${moduleIdx + 1}.${lessonIdxInMod + 1}`;

  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson =
    currentIdx >= 0 && currentIdx < allLessons.length - 1
      ? allLessons[currentIdx + 1]
      : null;

  // Notes: split lead paragraph (used as summary; don't render it twice)
  const rawNotes = (lesson.notes ?? null) as NotesBlock[] | null;
  const { summary, bodyBlocks } = splitLeadParagraph(rawNotes);

  // Thumbnail URL (computed server-side so client components stay clean)
  const thumbnailUrl = lesson.thumbnail?.asset
    ? urlFor(lesson.thumbnail).width(1280).height(720).url()
    : null;

  // Sidebar data
  const courseThumbnailLetter = course?.title?.charAt(0)?.toUpperCase() ?? "V";
  const sidebarModules = modules.map((mod) => ({
    _key: mod._key,
    title: mod.title,
    durationSeconds: mod.durationSeconds ?? null,
    lessons: (mod.lessons ?? []).map((l) => ({
      _id: l._id,
      title: l.title,
      slug: l.slug,
      duration: l.duration,
    })),
  }));

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="h-24 border-b border-canvas-line bg-canvas">
        <div className="max-w-360 mx-auto px-6 sm:px-10 h-full flex items-center">
          <Navbar
            links={[
              { label: "Courses", href: "/courses" },
              { label: "My Learning", href: "/my-learning" },
            ]}
            rightSlot={
              <div className="flex items-center gap-3">
                <button
                  aria-label="Notifications"
                  disabled
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 rounded-full cursor-not-allowed"
                >
                  <BellIcon size={20} />
                </button>
                <NavbarAuth />
              </div>
            }
          />
        </div>
      </header>

      <LessonPageTracker
        lessonSlug={slug}
        lessonTitle={lesson.title ?? ""}
        courseSlug={course?.slug ?? ""}
        courseTitle={course?.title ?? ""}
        lessonLabel={lessonLabel}
      />

      {/* ── Two-column layout ────────────────────────────────── */}
      <div className="lg:flex lg:items-start">
        {/* Sidebar */}
        {course && (
          <LessonSidebar
            course={{
              title: course.title,
              slug: course.slug,
              thumbnailLetter: courseThumbnailLetter,
            }}
            modules={sidebarModules}
            currentLessonSlug={lesson.slug ?? ""}
            currentModuleIdx={moduleIdx}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 pb-36">
          {/* Breadcrumbs */}
          <div className="py-5">
            <Breadcrumbs
              crumbs={[
                { label: "All Courses", href: "/courses" },
                ...(course?.slug && course?.title
                  ? [{ label: course.title, href: `/courses/${course.slug}` }]
                  : []),
                ...(currentFlat?.modTitle
                  ? [{ label: currentFlat.modTitle }]
                  : []),
                { label: lesson.title ?? "" },
              ]}
            />
          </div>

          {/* Lesson badge */}
          <div className="mb-3">
            <Badge variant="popular" className="uppercase tracking-wider text-[11px]">
              {lessonLabel}
            </Badge>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1
              className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              {lesson.title}
            </h1>
            <button
              type="button"
              aria-label="Bookmark lesson"
              className="shrink-0 w-10 h-10 border border-canvas-line rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <BookmarkIcon size={18} />
            </button>
          </div>

          {/* Summary */}
          {summary && (
            <p className="text-[17px] text-neutral-500 leading-[30px] mb-5">
              {summary}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-6 flex-wrap text-[14px] text-neutral-500 mb-6">
            {lesson.duration != null && lesson.duration > 0 && (
              <span className="flex items-center gap-1.5">
                <ClockIcon size={16} aria-hidden />
                {formatDuration(lesson.duration)}
              </span>
            )}
            {course?.level && (
              <span className="flex items-center gap-1.5">
                <BarChartIcon size={16} aria-hidden />
                {formatLevel(course.level)}
              </span>
            )}
            {lesson.studentCount != null && lesson.studentCount > 0 && (
              <span className="flex items-center gap-1.5">
                <UsersIcon size={16} aria-hidden />
                {formatCount(lesson.studentCount)} students
              </span>
            )}
          </div>

          {/* Video */}
          <div className="mb-8">
            <Suspense fallback={<div className="w-full rounded-xl bg-neutral-900" style={{ aspectRatio: "16/9" }} />}>
              <LessonVideo
                videoUrl={lesson.videoUrl ?? null}
                thumbnailUrl={thumbnailUrl}
                thumbnailAlt={lesson.thumbnail?.alt ?? lesson.title ?? ""}
                duration={lesson.duration ?? null}
                lessonSlug={slug}
                lessonTitle={lesson.title ?? ""}
              />
            </Suspense>
          </div>

          {/* Tabs */}
          <LessonTabs
            lessonSlug={slug}
            lessonContent={
              <div>
                <LessonNotes blocks={bodyBlocks as NotesBlock[]} />
                <LessonKeyPoints
                  keyPoints={lesson.keyPoints ?? null}
                  proTip={lesson.proTip ?? null}
                />
                <LessonResources
                  resources={lesson.resources ?? null}
                  lessonSlug={slug}
                />
              </div>
            }
          />
        </main>
      </div>

      {/* ── Footer nav ───────────────────────────────────────── */}
      <LessonFooterNav prev={prevLesson} next={nextLesson} />
    </div>
  );
}
