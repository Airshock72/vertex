import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";

import { sanityFetch } from "@/sanity/lib/fetch";
import { COURSE_BY_SLUG_QUERY, COURSE_SLUGS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type {
  COURSE_BY_SLUG_QUERY_RESULT,
  COURSE_SLUGS_QUERY_RESULT,
} from "@/sanity.types";

import { Navbar, Breadcrumbs } from "@/components/ui/navigation";
import { NavbarAuth } from "@/components/ui/navbar-auth";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  BellIcon,
  BarChartIcon,
  ClockIcon,
  LayersIcon,
  ArrowRightIcon,
  UsersIcon,
  BookmarkIcon,
  ZapIcon,
  WrenchIcon,
  PackageIcon,
  RocketIcon,
  LightbulbIcon,
  TargetIcon,
  SettingsIcon,
  SearchIcon,
  CheckCircleIcon,
  LockIcon,
} from "@/components/ui/icons";

import CourseModules, { CoursePageTracker } from "./CourseModules";
import { formatDuration, formatCount, formatLevel } from "@/lib/format";

/* ── Outcome icon map (emoji → SVG icon) ─────────────────── */

type IconFn = (props: { size?: number; className?: string }) => React.ReactElement;

const OUTCOME_ICONS: Record<string, IconFn> = {
  "🎯": TargetIcon,
  "⚡": ZapIcon,
  "🔧": WrenchIcon,
  "📦": PackageIcon,
  "🚀": RocketIcon,
  "💡": LightbulbIcon,
  "🛠️": WrenchIcon,
  "📊": BarChartIcon,
  "🔍": SearchIcon,
  "✅": CheckCircleIcon,
  "🔒": LockIcon,
  "⚙️": SettingsIcon,
};

/* ── Data fetching ───────────────────────────────────────── */

type Props = { params: Promise<{ slug: string }> };

const getCourse = cache(async (slug: string) => {
  const result = await sanityFetch({
    query: COURSE_BY_SLUG_QUERY,
    params: { slug },
    tags: ["course"],
  });
  return result as unknown as COURSE_BY_SLUG_QUERY_RESULT;
});

export async function generateStaticParams() {
  const slugs = (await sanityFetch({
    query: COURSE_SLUGS_QUERY,
    tags: ["course"],
  })) as unknown as COURSE_SLUGS_QUERY_RESULT;

  return slugs
    .filter((c): c is { slug: string } => c.slug !== null)
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return {};
  return { title: course.title ?? "Course", description: course.summary ?? "" };
}

/* ── Page ────────────────────────────────────────────────── */

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  const totalSeconds =
    course.modules?.reduce(
      (t, mod) =>
        t + (mod.lessons?.reduce((s, l) => s + (l.duration ?? 0), 0) ?? 0),
      0
    ) ?? 0;

  const moduleCount = course.modules?.length ?? 0;
  const firstLesson = course.modules
    ?.flatMap((mod) => mod.lessons ?? [])
    .find((l) => l.slug !== null);
  const firstLessonHref = firstLesson?.slug
    ? `/lessons/${firstLesson.slug}`
    : "/courses";

  const modules =
    course.modules?.map((mod) => ({
      _key: mod._key,
      title: mod.title,
      summary: mod.summary,
      lessons:
        mod.lessons?.map((l) => ({
          _id: l._id,
          title: l.title,
          slug: l.slug,
          duration: l.duration,
          freePreview: l.freePreview,
        })) ?? null,
    })) ?? [];

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

      <CoursePageTracker courseSlug={slug} courseTitle={course.title ?? ""} moduleCount={moduleCount} />
      <main className="max-w-360 mx-auto px-6 sm:px-10 pb-36">
        {/* ── Breadcrumbs ───────────────────────────────────── */}
        <div className="py-5">
          <Breadcrumbs
            crumbs={[
              { label: "All Courses", href: "/courses" },
              { label: course.title ?? "" },
            ]}
          />
        </div>

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="flex flex-col sm:flex-row gap-10 sm:gap-16 py-6 sm:py-10">
          {/* Cover image */}
          <div
            className="shrink-0 w-full sm:w-[280px] rounded-2xl overflow-hidden bg-neutral-900"
            style={{ aspectRatio: "280/328" }}
          >
            {course.coverImage?.asset && (
              <Image
                src={urlFor(course.coverImage).width(560).height(656).url()}
                alt={course.coverImage.alt ?? course.title ?? ""}
                width={280}
                height={328}
                className="w-full h-full object-cover"
                priority
              />
            )}
          </div>

          {/* Course info */}
          <div className="flex flex-col gap-5 flex-1 min-w-0">
            {course.popular && (
              <div>
                <Badge variant="popular">Popular</Badge>
              </div>
            )}

            <h1
              className="text-4xl sm:text-5xl font-bold text-neutral-900 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              {course.title}
            </h1>

            {course.summary && (
              <p className="text-lg text-neutral-500 leading-relaxed">
                {course.summary}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-5 flex-wrap text-sm text-neutral-500">
              {course.level && (
                <span className="flex items-center gap-1.5">
                  <BarChartIcon size={16} />
                  {formatLevel(course.level)}
                </span>
              )}
              {totalSeconds > 0 && (
                <span className="flex items-center gap-1.5">
                  <ClockIcon size={16} />
                  {formatDuration(totalSeconds)}
                </span>
              )}
              {moduleCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <LayersIcon size={16} />
                  {moduleCount} modules
                </span>
              )}
              {course.studentCount != null && course.studentCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <UsersIcon size={16} />
                  {formatCount(course.studentCount)} students
                </span>
              )}
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href={firstLessonHref}
                className="inline-flex items-center gap-2.5 h-14 px-8 bg-primary-500 text-white rounded-xl text-base font-medium hover:bg-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
              >
                Continue Learning
                <ArrowRightIcon size={18} />
              </Link>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2.5 h-14 px-6 border border-canvas-line bg-canvas rounded-xl text-base font-medium text-neutral-400 cursor-not-allowed"
              >
                <BookmarkIcon size={18} />
                Bookmark
              </button>
            </div>
          </div>
        </section>

        {/* ── What you'll learn ─────────────────────────────── */}
        {course.learningOutcomes && course.learningOutcomes.length > 0 && (
          <section className="rounded-2xl border border-canvas-line bg-white p-7 sm:p-8 mb-10">
            <h2
              className="text-2xl font-bold text-neutral-900 mb-6"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              What you&apos;ll learn
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {course.learningOutcomes.map((outcome) => {
                const emoji = outcome.icon ?? "";
                const OutcomeIcon = OUTCOME_ICONS[emoji] ?? null;
                return (
                  <div
                    key={outcome._key}
                    className="rounded-xl border border-neutral-100 p-7"
                  >
                    <div className="text-primary-500 mb-4">
                      {OutcomeIcon ? (
                        <OutcomeIcon size={48} />
                      ) : emoji ? (
                        <span className="text-4xl leading-none">{emoji}</span>
                      ) : null}
                    </div>
                    <h3
                      className="font-bold text-lg text-neutral-900 mb-2"
                      style={{ fontFamily: "var(--font-playfair-display)" }}
                    >
                      {outcome.title}
                    </h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      {outcome.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Course Content ────────────────────────────────── */}
        {modules.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold text-neutral-900"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                Course Content
              </h2>
              <span className="text-sm text-neutral-500">
                {moduleCount} module{moduleCount !== 1 ? "s" : ""} ·{" "}
                {formatDuration(totalSeconds)}
              </span>
            </div>
            <CourseModules modules={modules} courseSlug={slug} courseTitle={course.title ?? ""} />
          </section>
        )}
      </main>

      {/* ── Sticky progress bar ───────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-canvas border-t border-canvas-line">
        <div className="max-w-360 mx-auto px-6 sm:px-10">
          <div className="py-4 flex items-center gap-4 sm:gap-6">
            <div className="shrink-0 min-w-[90px]">
              <p className="text-xs text-neutral-500">Your Progress</p>
              <p className="text-sm">
                <span className="font-semibold text-neutral-900">0%</span>{" "}
                <span className="text-neutral-500">complete</span>
              </p>
            </div>
            <div className="hidden sm:flex flex-1">
              <ProgressBar value={0} showLabel={false} className="w-full" />
            </div>
            <Link
              href={firstLessonHref}
              className="shrink-0 inline-flex items-center gap-2.5 h-12 sm:h-14 px-6 sm:px-8 bg-primary-500 text-white rounded-xl text-sm sm:text-base font-medium hover:bg-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            >
              Continue Learning
              <ArrowRightIcon size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
