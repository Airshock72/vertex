import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCard, LessonCardReading, LessonCardVideo, ResourceCard } from "@/components/ui/card";
import { ExternalLinkIcon, PlayCircleIcon } from "@/components/ui/icons";
import { SearchInput, Select, TextInput } from "@/components/ui/input";
import { Breadcrumbs, Navbar, Pagination } from "@/components/ui/navigation";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusIndicator } from "@/components/ui/status-indicator";

const sectionLabel = "text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-6";

export default function DesignSystemPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-16 pb-16 border-b border-neutral-200">
        <p className="text-xs font-semibold tracking-widest text-primary-500 uppercase mb-3">
          Version 1.0 · May 2025
        </p>
        <h1
          className="text-5xl font-bold text-neutral-900 mb-4"
          style={{ fontFamily: "var(--font-playfair-display)" }}
        >
          Design System
        </h1>
        <p className="text-base text-neutral-500 max-w-md leading-relaxed">
          A unified design language for Vertex learning platform. Clean, modern and focused on
          clarity, consistency and intuitive learning experiences.
        </p>
      </div>

      {/* 01 Colors */}
      <section className="mb-16">
        <p className={sectionLabel}>01 · Colors</p>

        <div className="mb-8">
          <p className="text-sm font-medium text-neutral-700 mb-4">Primary</p>
          <div className="flex gap-3 flex-wrap">
            {[
              { name: "Primary 500", hex: "#F97316", cls: "bg-primary-500" },
              { name: "Primary 400", hex: "#FB923C", cls: "bg-primary-400" },
              { name: "Primary 300", hex: "#FDBA74", cls: "bg-primary-300" },
              { name: "Primary 200", hex: "#FED7AA", cls: "bg-primary-200" },
              { name: "Primary 100", hex: "#FFEDD5", cls: "bg-primary-100" },
            ].map((c) => (
              <div key={c.hex} className="flex flex-col gap-2">
                <div className={`w-20 h-14 rounded-md ${c.cls} border border-black/5`} />
                <p className="text-xs font-medium text-neutral-700">{c.name}</p>
                <p className="text-xs text-neutral-400 -mt-1">{c.hex}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-neutral-700 mb-4">Neutral</p>
          <div className="flex gap-3 flex-wrap">
            {[
              { name: "Neutral 900", hex: "#0F172A", cls: "bg-neutral-900" },
              { name: "Neutral 700", hex: "#334155", cls: "bg-neutral-700" },
              { name: "Neutral 500", hex: "#64748B", cls: "bg-neutral-500" },
              { name: "Neutral 300", hex: "#CBD5E1", cls: "bg-neutral-300" },
              { name: "Neutral 200", hex: "#E2E8F0", cls: "bg-neutral-200" },
              { name: "Neutral 100", hex: "#F1F5F9", cls: "bg-neutral-100" },
              { name: "Neutral 50",  hex: "#FAFAFC", cls: "bg-neutral-50" },
              { name: "White",       hex: "#FFFFFF", cls: "bg-white" },
            ].map((c) => (
              <div key={c.hex} className="flex flex-col gap-2">
                <div className={`w-20 h-14 rounded-md ${c.cls} border border-neutral-200`} />
                <p className="text-xs font-medium text-neutral-700">{c.name}</p>
                <p className="text-xs text-neutral-400 -mt-1">{c.hex}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 Typography */}
      <section className="mb-16">
        <p className={sectionLabel}>02 · Typography</p>

        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <p
              className="text-7xl font-bold text-neutral-900 leading-none mb-3"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              Ag
            </p>
            <p className="text-lg font-semibold text-neutral-900 mb-1" style={{ fontFamily: "var(--font-playfair-display)" }}>
              Playfair Display
            </p>
            <p className="text-sm text-neutral-500">Elegant · Readable · Timeless</p>
          </div>
          <div>
            <p className="text-7xl font-bold text-neutral-900 leading-none mb-3">Ag</p>
            <p className="text-lg font-semibold text-neutral-900 mb-1">Inter</p>
            <p className="text-sm text-neutral-500">Clean · Modern · Highly legible</p>
          </div>
        </div>

        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {["Style", "Font", "Size / Line Height", "Weight", "Use"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-neutral-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { style: "Display 1",  font: "Playfair Display", size: "48 / 56", weight: "Bold",      use: "Page titles",      display: true },
                { style: "Display 2",  font: "Playfair Display", size: "36 / 44", weight: "Bold",      use: "Section titles",   display: true },
                { style: "Heading 1",  font: "Inter",            size: "28 / 36", weight: "Semi Bold", use: "Card titles" },
                { style: "Heading 2",  font: "Inter",            size: "22 / 30", weight: "Semi Bold", use: "Sub section" },
                { style: "Heading 3",  font: "Inter",            size: "18 / 26", weight: "Medium",    use: "Small titles" },
                { style: "Body Large", font: "Inter",            size: "16 / 24", weight: "Regular",   use: "Body copy" },
                { style: "Body",       font: "Inter",            size: "14 / 20", weight: "Regular",   use: "Supporting text" },
                { style: "Small",      font: "Inter",            size: "12 / 16", weight: "Regular",   use: "Captions, meta" },
              ].map((row) => (
                <tr key={row.style} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                  <td
                    className="px-4 py-3 font-semibold text-neutral-900"
                    style={row.display ? { fontFamily: "var(--font-playfair-display)" } : {}}
                  >
                    {row.style}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{row.font}</td>
                  <td className="px-4 py-3 text-neutral-500">{row.size}</td>
                  <td className="px-4 py-3 text-neutral-500">{row.weight}</td>
                  <td className="px-4 py-3 text-neutral-400">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 03 Spacing & Radius */}
      <section className="mb-16">
        <p className={sectionLabel}>03 · Spacing & Radius</p>

        <div className="grid grid-cols-2 gap-12">
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-4">Spacing — Base unit: 4px</p>
            <div className="flex items-end gap-3 flex-wrap">
              {[
                { px: 4,  label: "4"  },
                { px: 8,  label: "8"  },
                { px: 12, label: "12" },
                { px: 16, label: "16" },
                { px: 24, label: "24" },
                { px: 32, label: "32" },
                { px: 40, label: "40" },
                { px: 48, label: "48" },
                { px: 64, label: "64" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <div
                    className="bg-primary-200 rounded-sm"
                    style={{ width: `${s.px}px`, height: `${s.px}px` }}
                  />
                  <span className="text-xs text-neutral-500">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-700 mb-4">Border Radius</p>
            <div className="flex items-end gap-5 flex-wrap">
              {[
                { label: "xs\n4px",  cls: "rounded-xs"  },
                { label: "sm\n8px",  cls: "rounded-sm"  },
                { label: "md\n12px", cls: "rounded-md"  },
                { label: "lg\n16px", cls: "rounded-lg"  },
                { label: "xl\n24px", cls: "rounded-xl"  },
                { label: "full",     cls: "rounded-full" },
              ].map((r) => (
                <div key={r.label} className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 border-2 border-neutral-300 bg-neutral-50 ${r.cls}`} />
                  <span className="text-xs text-neutral-500 text-center whitespace-pre">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04 Shadows */}
      <section className="mb-16">
        <p className={sectionLabel}>04 · Shadows</p>
        <div className="flex gap-8 flex-wrap">
          {[
            { label: "Sm", cls: "shadow-sm", desc: "0 1px 2px 0 rgba(15,23,42,0.05)"     },
            { label: "Md", cls: "shadow-md", desc: "0 4px 12px -2px rgba(15,23,42,0.08)"  },
            { label: "Lg", cls: "shadow-lg", desc: "0 12px 24px -4px rgba(15,23,42,0.10)" },
            { label: "Xl", cls: "shadow-xl", desc: "0 20px 40px -8px rgba(15,23,42,0.12)" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-4">
              <div className={`w-36 h-24 bg-white rounded-xl ${s.cls}`} />
              <div>
                <p className="text-sm font-medium text-neutral-700">{s.label}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 05 Buttons */}
      <section className="mb-16">
        <p className={sectionLabel}>05 · Buttons</p>
        <div className="space-y-5">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="w-20 text-xs text-neutral-400">Default</span>
            <Button variant="primary">Get Started</Button>
            <Button variant="secondary">Explore Courses</Button>
            <Button variant="tertiary" icon={<ExternalLinkIcon />}>View Lesson</Button>
            <Button variant="text" icon={<PlayCircleIcon />}>Watch Video</Button>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="w-20 text-xs text-neutral-400">Hover</span>
            <Button variant="primary" className="bg-primary-400">Get Started</Button>
            <Button variant="secondary" className="bg-primary-100">Explore Courses</Button>
            <Button variant="tertiary" icon={<ExternalLinkIcon />} className="text-neutral-900">View Lesson</Button>
            <Button variant="text" icon={<PlayCircleIcon />} className="text-primary-400">Watch Video</Button>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="w-20 text-xs text-neutral-400">Disabled</span>
            <Button variant="primary" disabled>Get Started</Button>
            <Button variant="secondary" disabled>Explore Courses</Button>
            <Button variant="tertiary" disabled icon={<ExternalLinkIcon />}>View Lesson</Button>
            <Button variant="text" disabled icon={<PlayCircleIcon />}>Watch Video</Button>
          </div>
        </div>
      </section>

      {/* 06 Inputs */}
      <section className="mb-16">
        <p className={sectionLabel}>06 · Inputs</p>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-700">Search / Text Input</p>
            <SearchInput />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-700">Select</p>
            <Select
              options={[
                { label: "Most Relevant", value: "relevant" },
                { label: "Most Recent",   value: "recent"   },
                { label: "Most Popular",  value: "popular"  },
              ]}
              value="relevant"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-700">Text Input</p>
            <TextInput placeholder="Enter your email…" type="email" />
          </div>
        </div>
      </section>

      {/* 07 Badges */}
      <section className="mb-16">
        <p className={sectionLabel}>07 · Badges</p>
        <div className="flex items-center gap-8">
          {[
            { label: "Video",   variant: "video"   as const },
            { label: "Lesson",  variant: "lesson"  as const },
            { label: "Popular", variant: "popular" as const },
          ].map(({ label, variant }) => (
            <div key={variant} className="flex flex-col items-start gap-2">
              <span className="text-xs text-neutral-400">{label}</span>
              <Badge variant={variant}>{label}</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* 08 Status Indicators */}
      <section className="mb-16">
        <p className={sectionLabel}>08 · Status Indicators</p>
        <div className="flex items-center gap-8 flex-wrap">
          <StatusIndicator status="in-progress" />
          <StatusIndicator status="completed" />
          <StatusIndicator status="now-playing" />
          <StatusIndicator status="locked" />
        </div>
      </section>

      {/* 09 Progress Bar */}
      <section className="mb-16">
        <p className={sectionLabel}>09 · Progress Bar</p>
        <div className="max-w-md space-y-4">
          <ProgressBar value={35} />
          <ProgressBar value={68} />
          <ProgressBar value={100} />
        </div>
      </section>

      {/* 10 Cards */}
      <section className="mb-16">
        <p className={sectionLabel}>10 · Cards</p>
        <div className="grid grid-cols-2 gap-5">
          <CourseCard
            iconLabel="N"
            iconBg="#0F172A"
            title="Next.js for Production"
            description="Build scalable, high-performance web applications with Next.js."
            level="Intermediate"
            duration="18h 24m"
            modules={12}
          />
          <LessonCardVideo
            title="Data Fetching in Server Components"
            description="Learn how to fetch data on the server using async/await and Next.js best practices."
            lessonRef="Lesson 5.1"
            duration="12:45"
            watchFrom="12:45"
          />
          <LessonCardReading
            title="Data Fetching & Caching"
            description="Explore different data fetching methods in Next.js to cache and revalidate data for optimal performance."
            moduleRef="Module 5"
          />
          <ResourceCard
            title="Caching and Revalidation Guide"
            description="Deep dive into Next.js caching strategies."
            type="PDF"
            size="1.2 MB"
          />
        </div>
      </section>

      {/* 11 Navigation */}
      <section className="mb-16">
        <p className={sectionLabel}>11 · Navigation</p>
        <div className="space-y-8">
          <div className="p-5 border border-neutral-200 rounded-xl">
            <Navbar
              links={[
                { label: "Courses",     href: "/courses",     active: true },
                { label: "My Learning", href: "/my-learning"               },
              ]}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-3">Breadcrumbs</p>
            <Breadcrumbs
              crumbs={[
                { label: "All Courses",            href: "/courses"         },
                { label: "Next.js for Production", href: "/courses/nextjs"  },
                { label: "Data Fetching & Caching"                          },
              ]}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-3">Pagination</p>
            <Pagination current={1} total={8} />
          </div>
        </div>
      </section>

      {/* 12 Principles */}
      <section>
        <p className={sectionLabel}>12 · Principles</p>
        <div className="grid grid-cols-4 gap-5">
          {[
            { title: "Clarity First", desc: "Every element should communicate clearly." },
            { title: "Consistency",   desc: "Use components and patterns consistently across the platform." },
            { title: "Focus & Calm",  desc: "Remove noise and help learners focus on what matters." },
            { title: "Accessible",    desc: "Design with accessibility and inclusivity in mind." },
          ].map((p) => (
            <div key={p.title} className="p-5 bg-neutral-50 rounded-xl border border-neutral-100">
              <p className="text-sm font-semibold text-neutral-900 mb-2">{p.title}</p>
              <p className="text-xs text-neutral-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
