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

function clientId(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

function acquireSlot(id: string): 'ok' | 'rate' | 'concurrency' {
  const now = Date.now()
  const s = clientStates.get(id) ?? { timestamps: [], active: 0 }
  s.timestamps = s.timestamps.filter((t) => now - t < RATE_WINDOW_MS)
  if (s.active >= CONCURRENCY_MAX) { clientStates.set(id, s); return 'concurrency' }
  if (s.timestamps.length >= RATE_MAX) { clientStates.set(id, s); return 'rate' }
  s.timestamps.push(now)
  s.active += 1
  clientStates.set(id, s)
  return 'ok'
}

function releaseSlot(id: string): void {
  const s = clientStates.get(id)
  if (s) s.active = Math.max(0, s.active - 1)
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
    const [initialContext, client] = await Promise.all([
      fetchInitialContext(),
      createSearchMcpClient(),
    ])
    mcpClient = client

    const allMcpTools = await mcpClient.tools()
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
      ph.capture({
        distinctId: 'anonymous',
        event: 'search_performed',
        properties: { query, resultCount: results.length, sort },
      })
      await ph.shutdown()
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
