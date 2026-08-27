import Link from "next/link";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icons";

export function SearchEmptyState() {
  return (
    <div className="mt-8 rounded-xl bg-primary-100 border border-primary-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
      <div className="shrink-0 w-14 h-14 rounded-full border-2 border-primary-300 bg-white flex items-center justify-center">
        <SearchIcon size={22} className="text-primary-400" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <p className="text-base font-semibold text-neutral-900">
          Can&apos;t find what you&apos;re looking for?
        </p>
        <p className="text-sm text-neutral-500 mt-1">
          Try different keywords or browse our full course catalog.
        </p>
      </div>
      <Link
        href="/courses"
        className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 rounded"
      >
        Browse all courses
        <ArrowRightIcon size={16} />
      </Link>
    </div>
  );
}
