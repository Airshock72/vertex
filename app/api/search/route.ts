import { type NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { keywordSearchHits } from '@/lib/search/keyword-search'
import { groundHits } from '@/lib/search/ground'
import { SearchRequestSchema } from '@/lib/search/types'
import { getPostHogClient } from '@/lib/posthog-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// In-process rate and concurrency limiter (single-process deployments; resets on cold start)
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 30
const CONCURRENCY_MAX = 4

type ClientState = { timestamps: number[]; active: number }
const clientStates = new Map<string, ClientState>()

// x-real-ip is set by trusted reverse proxies and not forwarded from clients.
// Fall back to the rightmost x-forwarded-for entry, which a trusted proxy appends
// (the leftmost is client-supplied and can be rotated to evade per-client limits).
function clientId(req: NextRequest): string {
  const realIp = req.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const last = forwarded.split(',').at(-1)?.trim()
    if (last) return last
  }
  return 'unknown'
}

function acquireSlot(id: string): 'ok' | 'rate' | 'concurrency' {
  const now = Date.now()
  const s = clientStates.get(id) ?? { timestamps: [], active: 0 }
  s.timestamps = s.timestamps.filter((t) => now - t < RATE_WINDOW_MS)
  // Evict idle entries so the map does not grow without bound
  if (s.timestamps.length === 0 && s.active === 0) clientStates.delete(id)
  if (s.active >= CONCURRENCY_MAX) { clientStates.set(id, s); return 'concurrency' }
  if (s.timestamps.length >= RATE_MAX) { clientStates.set(id, s); return 'rate' }
  s.timestamps.push(now)
  s.active += 1
  clientStates.set(id, s)
  return 'ok'
}

function releaseSlot(id: string): void {
  const s = clientStates.get(id)
  if (!s) return
  s.active = Math.max(0, s.active - 1)
  if (s.active === 0) {
    // Filter expired timestamps at the release boundary so entries whose
    // rate-limit window has passed are removed without waiting for a
    // subsequent request from the same client.
    const now = Date.now()
    s.timestamps = s.timestamps.filter((t) => now - t < RATE_WINDOW_MS)
    if (s.timestamps.length === 0) clientStates.delete(id)
  }
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = SearchRequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 })
  }

  const { query, sort } = parsed.data

  // Server-known identity wins; fall back to client-supplied for anonymous attribution
  const { userId } = await auth()
  const phDistinctId = userId ?? parsed.data.distinctId ?? 'anonymous'
  const phSessionId = parsed.data.sessionId

  const id = clientId(req)
  const slot = acquireSlot(id)
  if (slot === 'rate') {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }
  if (slot === 'concurrency') {
    return Response.json({ error: 'Too many concurrent requests' }, { status: 429 })
  }

  try {
    const results = await groundHits(await keywordSearchHits(query), sort)

    const ph = getPostHogClient()
    if (ph) {
      try {
        const videoCount = results.filter((r) => r.kind === 'video').length
        const lessonCount = results.filter((r) => r.kind === 'lesson').length
        ph.capture({
          distinctId: phDistinctId,
          event: 'search_performed',
          properties: {
            query,
            sort,
            result_count: results.length,
            video_result_count: videoCount,
            lesson_result_count: lessonCount,
            zero_results: results.length === 0,
            signed_in: userId !== null,
            ...(phSessionId ? { $session_id: phSessionId } : {}),
          },
        })
        await ph.flush()
      } catch {
        // Analytics errors must not affect the search response
      }
    }

    return Response.json({
      query,
      sort,
      count: results.length,
      reply: '',
      results,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api/search]', message)

    const ph = getPostHogClient()
    if (ph) {
      try {
        ph.capture({
          distinctId: phDistinctId,
          event: 'search_failed',
          properties: {
            query,
            sort,
            reason: 'upstream',
            ...(phSessionId ? { $session_id: phSessionId } : {}),
          },
        })
        await ph.flush()
      } catch {}
    }

    return Response.json({ error: 'Search failed' }, { status: 500 })
  } finally {
    releaseSlot(id)
  }
}
