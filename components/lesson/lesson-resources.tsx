"use client";

import posthog from "posthog-js";
import {
  ExternalLinkIcon,
  FileIcon,
  LinkIcon,
  CodeIcon,
  FolderGitIcon,
  PresentationIcon,
} from "@/components/ui/icons";

type ResourceType = "pdf" | "link" | "repo" | "code" | "slides" | null;

interface Resource {
  _key: string;
  type: ResourceType;
  title: string | null;
  description: string | null;
  url: string | null;
}

interface LessonResourcesProps {
  resources: Resource[] | null;
  lessonSlug: string;
}

const RESOURCE_ICONS: Record<string, (props: { size?: number; className?: string }) => React.ReactElement> = {
  pdf: FileIcon,
  link: LinkIcon,
  code: CodeIcon,
  repo: FolderGitIcon,
  slides: PresentationIcon,
};

export function LessonResources({ resources, lessonSlug }: LessonResourcesProps) {
  if (!resources || resources.length === 0) return null;

  return (
    <div className="mt-6">
      <hr className="border-canvas-line mb-6" />
      <h2
        className="text-xl font-bold text-neutral-900 mb-4"
        style={{ fontFamily: "var(--font-playfair-display)" }}
      >
        Resources
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((res) => {
          const Icon = RESOURCE_ICONS[res.type ?? "link"] ?? LinkIcon;
          const isValidUrl =
            res.url?.startsWith("https://") || res.url?.startsWith("http://");

          const card = (
            <div className="group relative flex flex-col gap-3 rounded-xl border border-canvas-line p-5 hover:border-neutral-300 transition-colors">
              {/* Icon tile */}
              <div className="w-8 h-8 rounded-md bg-primary-100 flex items-center justify-center text-primary-500 shrink-0">
                <Icon size={16} aria-hidden />
              </div>

              <div className="flex-1 min-w-0 pr-5">
                <p className="text-[14px] font-medium text-neutral-900 leading-snug">
                  {res.title}
                </p>
                {res.description && (
                  <p className="text-[13px] text-neutral-500 leading-5 mt-1">
                    {res.description}
                  </p>
                )}
              </div>

              <ExternalLinkIcon
                size={16}
                className="absolute bottom-4 right-4 text-neutral-400 group-hover:text-neutral-600 transition-colors"
                aria-hidden
              />
            </div>
          );

          if (isValidUrl && res.url) {
            return (
              <a
                key={res._key}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  posthog.capture("lesson_resource_clicked", {
                    lesson_slug: lessonSlug,
                    resource_title: res.title,
                    resource_type: res.type,
                    resource_url: res.url,
                  })
                }
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
                aria-label={res.title ?? "Resource"}
              >
                {card}
              </a>
            );
          }

          return <div key={res._key}>{card}</div>;
        })}
      </div>
    </div>
  );
}
