import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface CourseIconProps {
  courseTitle: string;
  courseIconRef?: string | null;
  size?: number;
  className?: string;
}

export function CourseIcon({
  courseTitle,
  courseIconRef,
  size = 20,
  className = "",
}: CourseIconProps) {
  const initial = courseTitle.charAt(0).toUpperCase();
  const fontSize = Math.max(8, Math.round(size * 0.45));

  if (courseIconRef) {
    return (
      <div
        className={`shrink-0 rounded overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={urlFor({ _ref: courseIconRef })
            .width(size * 2)
            .height(size * 2)
            .url()}
          alt={courseTitle}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 rounded bg-neutral-900 flex items-center justify-center text-white font-bold ${className}`}
      style={{ width: size, height: size, fontSize }}
    >
      {initial}
    </div>
  );
}
