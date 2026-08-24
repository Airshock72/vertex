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

const MODEL_ID = (process.env.SEARCH_MODEL ?? 'gpt-4o-mini') as Parameters<typeof openai>[0]

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

    if (message.includes('Missing env')) {
      return Response.json({ error: 'Search is not configured' }, { status: 500 })
    }

    return Response.json({ error: 'Search failed' }, { status: 502 })
  } finally {
    await mcpClient?.close().catch(() => {})
  }
}
