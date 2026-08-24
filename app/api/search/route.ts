import { createHash } from 'crypto'
import { type NextRequest } from 'next/server'
import { generateText, Output, isStepCount } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createSearchMcpClient, fetchInitialContext } from '@/lib/search/mcp'
import { SYSTEM_PROMPT } from '@/lib/search/system-prompt'
import { groundHits } from '@/lib/search/ground'
import { SearchRequestSchema, ModelOutputSchema } from '@/lib/search/types'
import { getPostHogClient } from '@/lib/posthog-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MODEL_ID = (process.env.SEARCH_MODEL?.trim() || 'gpt-4o-mini') as Parameters<typeof openai>[0]

// In-process rate and concurrency limiter (single-process deployments; resets on cold start)
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 10
const CONCURRENCY_MAX = 2

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

  const id = clientId(req)
  const slot = acquireSlot(id)
  if (slot === 'rate') {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }
  if (slot === 'concurrency') {
    return Response.json({ error: 'Too many concurrent requests' }, { status: 429 })
  }

  let mcpClient: Awaited<ReturnType<typeof createSearchMcpClient>> | null = null

  try {
    // allSettled so a resolved MCP client is always assigned before any error
    // is rethrown — the finally block can then close it reliably.
    const [contextOutcome, clientOutcome] = await Promise.allSettled([
      fetchInitialContext(),
      createSearchMcpClient(),
    ])
    if (clientOutcome.status === 'fulfilled') mcpClient = clientOutcome.value
    if (contextOutcome.status === 'rejected') throw contextOutcome.reason
    if (clientOutcome.status === 'rejected') throw clientOutcome.reason
    const initialContext = (contextOutcome as PromiseFulfilledResult<string>).value

    const allMcpTools = await mcpClient!.tools()
    // Exclude initial_context — schema is already injected into the system prompt
    const mcpTools = Object.fromEntries(
      Object.entries(allMcpTools).filter(([k]) => k !== 'initial_context'),
    )

    const systemPrompt = `${SYSTEM_PROMPT}\n\n## Schema context\n\n${initialContext}`

    const result = await generateText({
      model: openai(MODEL_ID),
      system: systemPrompt,
      prompt: query,
      tools: mcpTools as Parameters<typeof generateText>[0]['tools'],
      stopWhen: isStepCount(6),
      output: Output.object({ schema: ModelOutputSchema }),
    })

    const modelOutput = result.output

    const results = await groundHits(modelOutput.hits, sort)

    const ph = getPostHogClient()
    if (ph) {
      try {
        const queryHash = createHash('sha256').update(query).digest('hex')
        ph.capture({
          distinctId: 'anonymous',
          event: 'search_performed',
          properties: { queryHash, resultCount: results.length, sort },
        })
        // flush sends pending events without tearing down the singleton client
        await ph.flush()
      } catch {
        // Analytics errors must not affect the search response
      }
    }

    return Response.json({
      query,
      sort,
      count: results.length,
      reply: modelOutput.reply,
      results,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api/search]', message)

    if (message.includes('Missing env') || message.includes('must use HTTPS')) {
      return Response.json({ error: 'Search is not configured' }, { status: 500 })
    }

    return Response.json({ error: 'Search failed' }, { status: 502 })
  } finally {
    releaseSlot(id)
    await mcpClient?.close().catch(() => {})
  }
}
