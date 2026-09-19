import 'server-only'

import { client } from '@/sanity/lib/client'
import type { ModelHit } from './types'

const MAX_RESULTS = 100
const REASON_MAX = 160

type SearchRow = { _id: string; score: number; excerpt: string | null }

// Token-based keyword match over lessons. Wildcards each term and ORs them (never a whole-phrase
// match). Ranks by field weight: title (x3) > key points (x2) > notes (x1). notes is Portable Text,
// matched via its plain-text projection. Card data itself is re-fetched, typed, in groundHits.
const LESSON_SEARCH_GROQ = `*[_type == "lesson" && count($terms[^.title match @ || pt::text(^.notes) match @ || ^.keyPoints[] match @]) > 0]{
  _id,
  "score": count($terms[^.title match @]) * 3 + count($terms[^.keyPoints[] match @]) * 2 + count($terms[pt::text(^.notes) match @]),
  "excerpt": pt::text(notes)
} | order(score desc)[0...${MAX_RESULTS}]`

function toTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^\p{L}\p{N}]+/gu, ''))
    .filter((t) => t.length > 0)
    .map((t) => `${t}*`)
}

export async function keywordSearchHits(query: string): Promise<ModelHit[]> {
  const terms = toTerms(query)
  if (terms.length === 0) return []

  const rows = await client.fetch<SearchRow[]>(LESSON_SEARCH_GROQ, { terms })

  return rows.map((row, i) => {
    const excerpt = row.excerpt?.trim().replace(/\s+/g, ' ') ?? ''
    const reason =
      excerpt.length === 0
        ? `Matches your search for “${query.trim()}”.`
        : excerpt.length > REASON_MAX
          ? `${excerpt.slice(0, REASON_MAX).trimEnd()}…`
          : excerpt
    return {
      lessonId: row._id,
      kind: 'lesson' as const,
      reason,
      rank: i + 1,
      startSeconds: null,
    }
  })
}
