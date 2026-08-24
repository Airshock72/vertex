export function lessonHref(slug: string, startSeconds?: number): string {
  if (startSeconds && startSeconds > 0) {
    return `/lessons/${slug}?t=${Math.floor(startSeconds)}`;
  }
  return `/lessons/${slug}`;
}

export function courseHref(slug: string): string {
  return `/courses/${slug}`;
}
