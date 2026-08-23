export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatLevel(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export const LEVEL_DISPLAY: Record<
  string,
  "Beginner" | "Intermediate" | "Advanced"
> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
