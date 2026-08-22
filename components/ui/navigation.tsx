import { type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, VertexIcon } from "./icons";

/* ── Navbar ──────────────────────────────────────────────── */

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

interface NavbarProps {
  links?: NavLink[];
  className?: string;
  rightSlot?: ReactNode;
}

export function Navbar({ links = [], className = "", rightSlot }: NavbarProps) {
  return (
    <nav className={`flex items-center ${rightSlot ? "w-full justify-between" : "gap-8"} ${className}`}>
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <VertexIcon size={22} />
          <span className="text-base font-semibold text-neutral-900">Vertex</span>
        </Link>
        {links.length > 0 && (
          <ul className="flex items-center gap-6">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    link.active
                      ? "text-primary-500"
                      : "text-neutral-700 hover:text-neutral-900"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      {rightSlot && <div className="flex items-center">{rightSlot}</div>}
    </nav>
  );
}

/* ── Breadcrumbs ─────────────────────────────────────────── */

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
  className?: string;
}

export function Breadcrumbs({ crumbs, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 flex-wrap ${className}`}>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {crumb.href && !isLast ? (
              <a
                href={crumb.href}
                className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                {crumb.label}
              </a>
            ) : (
              <span className={`text-sm ${isLast ? "text-neutral-900 font-medium" : "text-neutral-500"}`}>
                {crumb.label}
              </span>
            )}
            {!isLast && <ChevronRightIcon size={12} className="text-neutral-300" />}
          </span>
        );
      })}
    </nav>
  );
}

/* ── Pagination ──────────────────────────────────────────── */

interface PaginationProps {
  current: number;
  total: number;
  className?: string;
}

export function Pagination({ current, total, className = "" }: PaginationProps) {
  const pages = buildPages(current, total);

  return (
    <nav aria-label="Pagination" className={`flex items-center gap-1 ${className}`}>
      <button
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeftIcon size={16} />
      </button>

      {pages.map((page, i) =>
        page === "…" ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-neutral-400">
            …
          </span>
        ) : (
          <button
            key={page}
            aria-current={page === current ? "page" : undefined}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
              page === current
                ? "bg-primary-500 text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        disabled={current === total}
        className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRightIcon size={16} />
      </button>
    </nav>
  );
}

function buildPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "…", total];
  if (current >= total - 2) return [1, "…", total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}
