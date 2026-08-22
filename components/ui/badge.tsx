type BadgeVariant = "video" | "lesson" | "popular";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  video: "bg-primary-500 text-white",
  lesson: "bg-[#6366F1] text-white",
  popular: "bg-neutral-900 text-white",
};

export function Badge({ variant = "video", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
