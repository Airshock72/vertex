"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BellIcon, BookmarkIcon, RocketIcon } from "./icons";

/* ── Toast context ───────────────────────────────────────── */

const AUTO_DISMISS_MS = 3500;

type ComingSoonContextValue = { show: (message: string) => void };

const ComingSoonContext = createContext<ComingSoonContextValue | null>(null);

export function useComingSoon(): ComingSoonContextValue {
  const ctx = useContext(ComingSoonContext);
  if (!ctx) throw new Error("useComingSoon must be used within a ComingSoonProvider");
  return ctx;
}

export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    timerRef.current = setTimeout(() => setMessage(null), AUTO_DISMISS_MS);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <ComingSoonContext.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      >
        {message && (
          <div
            key={message}
            style={{ animation: "coming-soon-toast-in 200ms ease-out" }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-lg"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-500">
              <RocketIcon size={18} />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-neutral-900">{message}</p>
              <p className="text-neutral-500">We&apos;re working on it — check back soon.</p>
            </div>
          </div>
        )}
      </div>
    </ComingSoonContext.Provider>
  );
}

/* ── Trigger: Notification bell ──────────────────────────── */

export function NotificationBell({
  variant = "default",
  className = "",
}: {
  variant?: "default" | "muted";
  className?: string;
}) {
  const { show } = useComingSoon();
  const look =
    variant === "muted"
      ? "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
      : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100";

  return (
    <button
      type="button"
      aria-label="Notifications"
      onClick={() => show("Notifications are coming soon")}
      className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ${look} ${className}`}
    >
      <BellIcon size={20} />
    </button>
  );
}

/* ── Trigger: Bookmark ───────────────────────────────────── */

export function BookmarkButton({ variant }: { variant: "course" | "lesson" }) {
  const { show } = useComingSoon();
  const onClick = () => show("Bookmarks are coming soon");

  if (variant === "course") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2.5 h-14 px-6 border border-canvas-line bg-canvas rounded-xl text-base font-medium text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <BookmarkIcon size={18} />
        Bookmark
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Bookmark lesson"
      onClick={onClick}
      className="shrink-0 w-10 h-10 border border-canvas-line rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <BookmarkIcon size={18} />
    </button>
  );
}

/* ── Nav links (intercepts "coming soon" entries) ────────── */

export type NavLink = {
  label: string;
  href: string;
  active?: boolean;
  comingSoon?: boolean;
};

export function ComingSoonNavLinks({ links }: { links: NavLink[] }) {
  const { show } = useComingSoon();

  return (
    <ul className="flex items-center gap-6">
      {links.map((link) => {
        const cls = `text-sm font-medium transition-colors ${
          link.active ? "text-primary-500" : "text-neutral-700 hover:text-neutral-900"
        }`;
        return (
          <li key={link.href}>
            {link.comingSoon ? (
              <button type="button" onClick={() => show(`${link.label} is coming soon`)} className={cls}>
                {link.label}
              </button>
            ) : (
              <a href={link.href} className={cls}>
                {link.label}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
