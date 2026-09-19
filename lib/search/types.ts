import { z } from 'zod'

// Internal hit shape consumed by groundHits to build result cards.
export type ModelHit = {
  lessonId: string
  kind: 'lesson' | 'video'
  reason: string
  rank: number
  startSeconds: number | null
}

// Search request (constraints are fine here — not passed to OpenAI)
export const SearchRequestSchema = z.object({
  query: z.string().trim().min(1).max(200),
  sort: z.enum(['relevance', 'newest', 'duration']).default('relevance'),
  // Analytics attribution — client-supplied, never trusted for auth
  distinctId: z.string().max(200).optional(),
  sessionId: z.string().max(200).optional(),
})

export type SearchRequest = z.infer<typeof SearchRequestSchema>

// Grounded result cards
export const LessonResultSchema = z.object({
  kind: z.literal('lesson'),
  lessonId: z.string(),
  lessonSlug: z.string(),
  lessonTitle: z.string(),
  courseTitle: z.string(),
  courseSlug: z.string(),
  moduleTitle: z.string(),
  label: z.string(),
  keyPoints: z.array(z.string()),
  duration: z.number().nullable(),
  courseIconRef: z.string().nullable(),
  reason: z.string(),
  rank: z.number(),
  href: z.string(),
})

export const VideoResultSchema = z.object({
  kind: z.literal('video'),
  lessonId: z.string(),
  lessonSlug: z.string(),
  lessonTitle: z.string(),
  courseTitle: z.string(),
  courseSlug: z.string(),
  moduleTitle: z.string(),
  label: z.string(),
  startSeconds: z.number(),
  duration: z.number().nullable(),
  thumbnailRef: z.string().nullable(),
  courseIconRef: z.string().nullable(),
  reason: z.string(),
  rank: z.number(),
  href: z.string(),
})

export const SearchResultSchema = z.discriminatedUnion('kind', [
  LessonResultSchema,
  VideoResultSchema,
])

export type LessonResult = z.infer<typeof LessonResultSchema>
export type VideoResult = z.infer<typeof VideoResultSchema>
export type SearchResult = z.infer<typeof SearchResultSchema>

export const SearchResponseSchema = z.object({
  query: z.string(),
  sort: z.enum(['relevance', 'newest', 'duration']),
  count: z.number(),
  reply: z.string(),
  results: z.array(SearchResultSchema),
})

export type SearchResponse = z.infer<typeof SearchResponseSchema>
