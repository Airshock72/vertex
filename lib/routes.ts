export function lessonHref(slug: string, startSeconds?: number): string {
  if (startSeconds && startSeconds > 0) {
    return `/lessons/${slug}?t=${Math.floor(startSeconds)}`;
  }
  return `/lessons/${slug}`;
}

export function courseHref(slug: string): string {
  return `/courses/${slug}`;
}

export function searchHref(query: string, sort?: string): string {
  const params = new URLSearchParams({ q: query });
  if (sort && sort !== 'relevance') params.set('sort', sort);
  return `/search?${params.toString()}`;
}
