"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useEffect } from "react";
import { SearchIcon } from "@/components/ui/icons";

const MAX_QUERY_LENGTH = 200;

interface SearchFormProps {
  defaultValue?: string;
  placeholder?: string;
  size?: "md" | "lg";
  className?: string;
}

export function SearchForm({
  defaultValue = "",
  placeholder,
  size = "md",
  className = "",
}: SearchFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (inputRef.current?.value ?? "").trim().slice(0, MAX_QUERY_LENGTH);
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  if (size === "lg") {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="relative">
          <SearchIcon
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <input
            ref={inputRef}
            type="search"
            defaultValue={defaultValue}
            placeholder={placeholder ?? "Ask anything about your learning..."}
            maxLength={MAX_QUERY_LENGTH}
            className="h-20 w-full rounded-xl border border-neutral-200 bg-white pl-14 pr-28 text-lg text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-primary-400 transition-colors shadow-md"
          />
          <SearchIcon
            size={20}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <SearchIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="search"
          defaultValue={defaultValue}
          placeholder={placeholder ?? "Search anything..."}
          maxLength={MAX_QUERY_LENGTH}
          className="h-11 w-full rounded-md border border-neutral-200 bg-white pl-9 pr-20 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-primary-400 transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
          <kbd className="h-5 px-1.5 rounded bg-neutral-100 text-neutral-500 text-[10px] font-mono leading-5">
            ⌘
          </kbd>
          <kbd className="h-5 px-1.5 rounded bg-neutral-100 text-neutral-500 text-[10px] font-mono leading-5">
            K
          </kbd>
        </div>
      </div>
    </form>
  );
}
