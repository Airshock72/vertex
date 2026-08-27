import 'server-only'

import { client } from '@/sanity/lib/client'
import { LESSONS_BY_IDS_QUERY } from '@/sanity/lib/queries'
import { lessonHref } from '../routes'
import type { ModelHit, SearchResult } from './types'
import type { LESSONS_BY_IDS_QUERY_RESULT } from '@/sanity.types'

const MAX_HITS = 100

type LessonRow = LESSONS_BY_IDS_QUERY_RESULT[number]

function deriveModuleAndLabel(
  lessonId: string,
  modules: NonNullable<NonNullable<LessonRow['course']>['modules']>,
): { moduleTitle: string; label: string } {
  for (let mi = 0; mi < modules.length; mi++) {
    const ids = modules[mi].lessonIds ?? []
    const li = ids.indexOf(lessonId)
    if (li !== -1) {
      return {
        moduleTitle: modules[mi].title ?? '',
        label: `${mi + 1}.${li + 1}`,
      }
    }
  }
  return { moduleTitle: '', label: '' }
}

export async function groundHits(
  hits: ModelHit[],
  sort: 'relevance' | 'newest' | 'duration',
): Promise<SearchResult[]> {
  if (hits.length === 0) return []

  const uniqueIds = [...new Set(hits.map((h) => h.lessonId))].slice(0, MAX_HITS)

  const rows: LessonRow[] = await client.fetch(LESSONS_BY_IDS_QUERY, { ids: uniqueIds })

  const byId = new Map<string, LessonRow>()
  for (const row of rows) byId.set(row._id, row)

  const results: SearchResult[] = []

  for (const hit of hits.slice(0, MAX_HITS)) {
    const lesson = byId.get(hit.lessonId)
    if (!lesson || !lesson.course || !lesson.slug || !lesson.title) {
      console.warn(`[search/ground] unresolvable or incomplete lessonId: ${hit.lessonId}`)
      continue
    }

    const course = lesson.course
    if (!course.slug || !course.title) {
      console.warn(`[search/ground] course missing slug/title for lesson: ${hit.lessonId}`)
      continue
    }

    const { moduleTitle, label } = deriveModuleAndLabel(
      hit.lessonId,
      course.modules ?? [],
    )

    if (hit.kind === 'video') {
      if (hit.startSeconds === null) {
        console.warn(`[search/ground] video hit missing startSeconds for ${hit.lessonId}`)
        continue
      }
      results.push({
        kind: 'video',
        lessonId: hit.lessonId,
        lessonSlug: lesson.slug,
        lessonTitle: lesson.title,
        courseTitle: course.title,
        courseSlug: course.slug,
        moduleTitle,
        label,
        startSeconds: hit.startSeconds,
        duration: lesson.duration ?? null,
        thumbnailRef: lesson.thumbnailRef ?? null,
        courseIconRef: course.coverImageRef ?? null,
        reason: hit.reason,
        rank: hit.rank,
        href: lessonHref(lesson.slug, hit.startSeconds),
      })
    } else {
      results.push({
        kind: 'lesson',
        lessonId: hit.lessonId,
        lessonSlug: lesson.slug,
        lessonTitle: lesson.title,
        courseTitle: course.title,
        courseSlug: course.slug,
        moduleTitle,
        label,
        keyPoints: lesson.keyPoints ?? [],
        duration: lesson.duration ?? null,
        courseIconRef: course.coverImageRef ?? null,
        reason: hit.reason,
        rank: hit.rank,
        href: lessonHref(lesson.slug),
      })
    }
  }

  if (sort === 'newest') {
    const createdAt = new Map(rows.map((r) => [r._id, r._createdAt]))
    results.sort((a, b) => {
      const ta = createdAt.get(a.lessonId) ?? ''
      const tb = createdAt.get(b.lessonId) ?? ''
      return tb.localeCompare(ta)
    })
  } else if (sort === 'duration') {
    const duration = new Map(rows.map((r) => [r._id, r.duration ?? Infinity]))
    results.sort((a, b) => (duration.get(a.lessonId) ?? Infinity) - (duration.get(b.lessonId) ?? Infinity))
  } else {
    results.sort((a, b) => a.rank - b.rank)
  }

  return results
}
