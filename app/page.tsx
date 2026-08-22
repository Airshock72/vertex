import { ArrowRightIcon, BellIcon, StarIcon } from "@/components/ui/icons";
import { Navbar } from "@/components/ui/navigation";
import { Avatar } from "@/components/ui/avatar";
import { CourseCard } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/input";
import { NextjsMark, DockerMark, TypescriptMark } from "@/components/brand/course-marks";

const courses = [
  {
    id: "nextjs",
    iconNode: <NextjsMark size={72} />,
    title: "Next.js for Production",
    description: "Build scalable, high-performance web applications with Next.js.",
    level: "Intermediate" as const,
    duration: "18h 24m",
    modules: 12,
  },
  {
    id: "docker",
    iconNode: <DockerMark size={72} />,
    title: "Docker Essentials",
    description: "Containerize applications and streamline your development workflow.",
    level: "Beginner" as const,
    duration: "10h 12m",
    modules: 8,
  },
  {
    id: "typescript",
    iconNode: <TypescriptMark size={72} />,
    title: "TypeScript Deep Dive",
    description: "Go beyond the basics and write safer, more expressive code.",
    level: "Intermediate" as const,
    duration: "14h 36m",
    modules: 10,
  },
];

const gutterPattern = {
  backgroundImage: [
    "repeating-linear-gradient(",
    "-45deg,",
    "rgba(180,130,90,0.065) 0,",
    "rgba(180,130,90,0.065) 1px,",
    "transparent 0,",
    "transparent 50%)",
  ].join(" "),
  backgroundSize: "12px 12px",
} as const;

const barHeights = [55, 90, 130, 100, 170, 140, 190, 60, 110, 150];

function ChartBars() {
  const half = Math.ceil(barHeights.length / 2);
  const left = barHeights.slice(0, half);
  const right = barHeights.slice(half);

  const bar = (h: number, i: number) => (
    <div
      key={i}
      className="w-9 rounded-t-sm shrink-0"
      style={{
        height: h,
        background: "linear-gradient(to top, rgba(249,115,22,0.55), rgba(249,115,22,0))",
      }}
    />
  );

  return (
    <div className="relative h-48 overflow-hidden" aria-hidden>
      <div className="absolute bottom-0 left-0 flex items-end gap-2.5">
        {left.map(bar)}
      </div>
      <div className="absolute bottom-0 right-0 flex items-end gap-2.5">
        {right.map(bar)}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-neutral-900">
      {/* ── Site header ──────────────────────────────────────── */}
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
                  className="w-10 h-10 flex items-center justify-center text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <BellIcon size={20} />
                </button>
                <Avatar initials="AB" size={40} />
              </div>
            }
          />
        </div>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Diagonal stripe gutters (only visible when column is narrower than viewport) */}
          <div
            className="absolute inset-0 bg-canvas"
            style={gutterPattern}
            aria-hidden
          />
          {/* Content column: solid canvas background with hairline borders */}
          <div className="relative max-w-360 mx-auto bg-canvas min-[1441px]:border-x min-[1441px]:border-canvas-line">
            <div className="px-6 sm:px-10 py-20 sm:py-28 text-center">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center border border-primary-500 rounded-full px-4 py-1.5 mb-8">
                <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-primary-500">
                  Intelligent Learning
                </span>
              </div>

              {/* Hero heading */}
              <h1
                className="text-5xl sm:text-6xl font-bold text-neutral-900 leading-tight mb-6"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                Search your learning
                <br />
                in plain English.
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-neutral-500 leading-relaxed mb-10 max-w-md mx-auto">
                Vertex understands what you want to learn and finds the exact lessons across all
                your courses.
              </p>

              {/* CTA */}
              <div className="mb-12">
                <a
                  href="/courses"
                  className="inline-flex items-center gap-2.5 h-16 px-8 bg-primary-500 text-white rounded-xl text-base font-medium hover:bg-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  Explore Courses
                  <ArrowRightIcon size={20} />
                </a>
              </div>

              {/* Search bar */}
              <SearchInput
                variant="lg"
                placeholder="Ask anything about your learning..."
                className="max-w-3xl mx-auto"
              />
            </div>
          </div>
        </section>

        {/* ── All Courses ───────────────────────────────────────── */}
        <section>
          <div className="max-w-360 mx-auto min-[1441px]:border-x min-[1441px]:border-canvas-line">
            <hr className="border-canvas-line" />
          </div>
          <div className="max-w-360 mx-auto min-[1441px]:border-x min-[1441px]:border-canvas-line px-6 sm:px-10 py-14">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-neutral-900">All Courses</h2>
              <a
                href="/courses"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded"
              >
                View all courses
                <ArrowRightIcon size={16} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  iconNode={course.iconNode}
                  title={course.title}
                  description={course.description}
                  level={course.level}
                  duration={course.duration}
                  modules={course.modules}
                  layout="stacked"
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer note ───────────────────────────────────────── */}
        <div className="max-w-360 mx-auto min-[1441px]:border-x min-[1441px]:border-canvas-line px-6 sm:px-10">
          <div className="py-8 flex items-center justify-center gap-2.5 border-t border-canvas-line">
            <StarIcon size={18} className="text-primary-400" />
            <span className="text-base text-neutral-500">
              New courses and lessons added every week.
            </span>
          </div>
        </div>

        {/* ── Bar decoration ────────────────────────────────────── */}
        <div className="max-w-360 mx-auto min-[1441px]:border-x min-[1441px]:border-canvas-line overflow-hidden">
          <ChartBars />
        </div>
      </main>
    </div>
  );
}
