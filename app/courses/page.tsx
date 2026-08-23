import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { sanityFetch } from "@/sanity/lib/fetch";
import { COURSES_LIST_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type { COURSES_LIST_QUERY_RESULT } from "@/sanity.types";
import { LEVEL_DISPLAY, formatDuration } from "@/lib/format";

import { Navbar, Breadcrumbs } from "@/components/ui/navigation";
import { NavbarAuth } from "@/components/ui/navbar-auth";
import { CourseCard } from "@/components/ui/card";
import { BellIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "All Courses — Vertex",
  description: "Browse every course on Vertex.",
};

export default async function CoursesPage() {
  const courses = (await sanityFetch({
    query: COURSES_LIST_QUERY,
    tags: ["course"],
  })) as unknown as COURSES_LIST_QUERY_RESULT;

  const valid = courses.filter((c) => c.slug !== null);

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="h-24 border-b border-canvas-line bg-canvas">
        <div className="max-w-360 mx-auto px-6 sm:px-10 h-full flex items-center">
          <Navbar
            links={[
              { label: "Courses", href: "/courses", active: true },
              { label: "My Learning", href: "/my-learning" },
            ]}
            rightSlot={
              <div className="flex items-center gap-3">
                <button
                  aria-label="Notifications"
                  className="w-10 h-10 flex items-center justify-center text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <BellIcon size={20} />
                </button>
                <NavbarAuth />
              </div>
            }
          />
        </div>
      </header>

      <main className="max-w-360 mx-auto px-6 sm:px-10 py-8 sm:py-12">
        {/* ── Breadcrumb ────────────────────────────────────── */}
        <div className="mb-8">
          <Breadcrumbs crumbs={[{ label: "All Courses" }]} />
        </div>

        {/* ── Heading row ───────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-3xl font-bold text-neutral-900"
            style={{ fontFamily: "var(--font-playfair-display)" }}
          >
            All Courses
          </h1>
          <span className="text-sm text-neutral-500">
            {valid.length} course{valid.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Grid ─────────────────────────────────────────── */}
        {valid.length === 0 ? (
          <p className="text-neutral-500 py-12 text-center">
            No courses available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {valid.map((course) => (
              <Link
                key={course._id}
                href={`/courses/${course.slug}`}
                className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <CourseCard
                  iconNode={
                    course.coverImage?.asset ? (
                      <Image
                        src={urlFor(course.coverImage)
                          .width(144)
                          .height(144)
                          .url()}
                        alt={course.coverImage.alt ?? course.title ?? ""}
                        width={72}
                        height={72}
                        className="rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-xl bg-neutral-900 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                        {course.title?.charAt(0) ?? "V"}
                      </div>
                    )
                  }
                  title={course.title ?? ""}
                  description={course.summary ?? ""}
                  level={LEVEL_DISPLAY[course.level ?? ""] ?? "Beginner"}
                  duration={
                    course.totalDuration
                      ? formatDuration(course.totalDuration)
                      : "—"
                  }
                  modules={course.moduleCount ?? 0}
                  layout="stacked"
                  className="h-full hover:border-primary-200 transition-colors"
                />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
