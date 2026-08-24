import 'server-only'

import { createMCPClient } from '@ai-sdk/mcp'

const MCP_URL = process.env.SANITY_CONTEXT_MCP_URL
const READ_TOKEN = process.env.SANITY_API_READ_TOKEN

if (!MCP_URL) throw new Error('Missing env: SANITY_CONTEXT_MCP_URL')
if (!READ_TOKEN) throw new Error('Missing env: SANITY_API_READ_TOKEN')

let cachedContext: string | null = null
let cachedAt = 0
const CONTEXT_TTL_MS = 5 * 60 * 1000

export async function fetchInitialContext(): Promise<string> {
  const now = Date.now()
  if (cachedContext && now - cachedAt < CONTEXT_TTL_MS) return cachedContext

  const base = MCP_URL!.split('?')[0].replace(/\/$/, '')
  const params = MCP_URL!.includes('?') ? '?' + MCP_URL!.split('?')[1] : ''
  const url = `${base}/initial-context${params}`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${READ_TOKEN}` },
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`initial-context fetch failed: ${res.status} ${res.statusText}`)

  cachedContext = await res.text()
  cachedAt = now
  return cachedContext
}

export function createSearchMcpClient() {
  return createMCPClient({
    transport: {
      type: 'http',
      url: MCP_URL!,
      headers: { Authorization: `Bearer ${READ_TOKEN}` },
    },
  })
}
