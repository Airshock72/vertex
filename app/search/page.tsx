import { Suspense } from "react";
import type { Metadata } from "next";

import { Navbar } from "@/components/ui/navigation";
import { NavbarAuth } from "@/components/ui/navbar-auth";
import { BellIcon } from "@/components/ui/icons";
import { SearchForm } from "@/components/search/search-form";
import { SearchResults } from "@/components/search/search-results";

type Props = {
  searchParams: Promise<{ q?: string; sort?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  return {
    title: query ? `Results for "${query}" — Vertex` : "Search — Vertex",
    description: query
      ? `Find lessons and video moments about "${query}" on Vertex.`
      : "Search for any topic across all Vertex courses.",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  return (
    <div className="min-h-screen bg-canvas">
      {/* Navbar */}
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
                <NavbarAuth />
              </div>
            }
          />
        </div>
      </header>

      <main>
        {/* Header block */}
        <section className="border-b border-canvas-line bg-canvas py-12 sm:py-16 text-center">
          <div className="max-w-360 mx-auto px-6 sm:px-10">
            <div className="inline-flex items-center border border-primary-500 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-primary-500">
                Search Results
              </span>
            </div>

            {query ? (
              <h1
                className="text-4xl sm:text-5xl font-bold text-neutral-900 leading-tight mb-8"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                Results for{" "}
                <span className="text-primary-500">&ldquo;{query}&rdquo;</span>
              </h1>
            ) : (
              <h1
                className="text-4xl sm:text-5xl font-bold text-neutral-900 leading-tight mb-8"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                What do you want to learn?
              </h1>
            )}

            {/* key forces remount when query changes, keeping the input in sync */}
            <SearchForm
              key={query}
              defaultValue={query}
              placeholder="Search anything..."
              className="max-w-[725px] mx-auto"
            />
          </div>
        </section>

        {/* Results */}
        <div className="max-w-360 mx-auto px-6 sm:px-10 py-8 sm:py-12">
          <Suspense>
            <SearchResults />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
