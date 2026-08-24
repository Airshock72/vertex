// YouTube ingestion adapter.
// Chapters: extracted from ytInitialData on the watch page.
// Cues: fetched via the InnerTube iOS player endpoint (only client context that returns
// usable caption track URLs — WEB returns UNPLAYABLE, ANDROID returns XML-only tracks).

const WATCH_BASE = 'https://www.youtube.com/watch'
const INNERTUBE_URL = 'https://www.youtube.com/youtubei/v1/player'

const IOS_CONTEXT = {
  clientName: 'IOS',
  clientVersion: '19.45.4',
  deviceMake: 'Apple',
  deviceModel: 'iPhone16,2',
  osName: 'iPhone',
  osVersion: '18.1.0.22B83',
}

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1'

/**
 * @param {string} videoId
 * @returns {Promise<{
 *   chapters: Array<{startSeconds: number, label: string}>,
 *   cues: Array<{start: number, text: string}>
 * }>}
 */
export async function fetchYouTube(videoId) {
  const [chapters, cues] = await Promise.all([
    fetchChapters(videoId),
    fetchCues(videoId),
  ])
  return { chapters, cues }
}

// ── Chapters ──────────────────────────────────────────────────────────────────

async function fetchChapters(videoId) {
  const html = await fetch(`${WATCH_BASE}?v=${encodeURIComponent(videoId)}`, {
    headers: { 'User-Agent': MOBILE_UA, 'Accept-Language': 'en-US,en;q=0.9' },
  }).then((r) => r.text())

  const data = extractYtInitialData(html)
  if (!data) return []

  return dedupeChapters(walkChapters(data))
}

function extractYtInitialData(html) {
  const marker = 'var ytInitialData = '
  const start = html.indexOf(marker)
  if (start === -1) return null

  // Walk the string from the opening `{` to find the matching `}`,
  // respecting string literals and escape sequences.
  let depth = 0
  let inString = false
  let escape = false
  let jsonEnd = -1
  const base = start + marker.length

  for (let i = base; i < html.length; i++) {
    const c = html[i]
    if (escape) { escape = false; continue }
    if (c === '\\' && inString) { escape = true; continue }
    if (c === '"') { inString = !inString; continue }
    if (inString) continue
    if (c === '{') { depth++ }
    else if (c === '}') {
      depth--
      if (depth === 0) { jsonEnd = i + 1; break }
    }
  }

  if (jsonEnd === -1) return null
  try {
    return JSON.parse(html.slice(base, jsonEnd))
  } catch {
    return null
  }
}

function walkChapters(node) {
  const results = []

  function walk(n) {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach(walk); return }

    if ('chapterRenderer' in n) {
      const r = n.chapterRenderer
      const ms = r?.timeRangeStartMillis
      const label = r?.title?.simpleText ?? r?.title?.runs?.[0]?.text
      if (typeof ms === 'number' && label) {
        results.push({ startSeconds: Math.floor(ms / 1000), label: String(label).trim() })
      }
    }

    if ('macroMarkersListItemRenderer' in n) {
      const r = n.macroMarkersListItemRenderer
      const ms = r?.timeRangeStartMillis
      const label = r?.title?.simpleText ?? r?.title?.runs?.[0]?.text
      if (typeof ms === 'number' && label) {
        results.push({ startSeconds: Math.floor(ms / 1000), label: String(label).trim() })
      }
    }

    for (const v of Object.values(n)) walk(v)
  }

  walk(node)
  return results
}

function dedupeChapters(chapters) {
  const seen = new Map()
  for (const c of chapters) {
    if (!seen.has(c.startSeconds)) seen.set(c.startSeconds, c)
  }
  return [...seen.values()].sort((a, b) => a.startSeconds - b.startSeconds)
}

// ── Cues ──────────────────────────────────────────────────────────────────────

async function fetchCues(videoId) {
  const playerRes = await fetch(INNERTUBE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-YouTube-Client-Name': '5',
      'X-YouTube-Client-Version': IOS_CONTEXT.clientVersion,
    },
    body: JSON.stringify({ videoId, context: { client: IOS_CONTEXT } }),
  })

  if (!playerRes.ok) {
    throw new Error(`InnerTube player returned ${playerRes.status}`)
  }

  const player = await playerRes.json()
  const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []

  if (tracks.length === 0) throw new Error('No caption tracks returned by InnerTube')

  // Prefer ASR English, then any English, then first track available
  const track =
    tracks.find((t) => t.languageCode === 'en' && t.kind === 'asr') ??
    tracks.find((t) => t.languageCode === 'en') ??
    tracks[0]

  if (!track?.baseUrl) throw new Error('Caption track has no baseUrl')

  const cueRes = await fetch(`${track.baseUrl}&fmt=json3`, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9' },
  })
  if (!cueRes.ok) throw new Error(`Caption fetch returned ${cueRes.status}`)

  const body = await cueRes.text()

  try {
    return parseCuesJson3(JSON.parse(body))
  } catch {
    return parseCuesXml(body)
  }
}

function parseCuesJson3(json) {
  return (json?.events ?? [])
    .filter((e) => e.segs && e.tStartMs !== undefined)
    .map((e) => ({
      start: e.tStartMs / 1000,
      text: e.segs.map((s) => s.utf8 ?? '').join('').replace(/\n/g, ' ').trim(),
    }))
    .filter((c) => c.text.length > 0)
}

function parseCuesXml(xml) {
  const re = /<text[^>]+start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g
  const cues = []
  let m
  while ((m = re.exec(xml)) !== null) {
    const text = decodeHtmlEntities(m[2]).replace(/\n/g, ' ').trim()
    if (text) cues.push({ start: parseFloat(m[1]), text })
  }
  return cues
}

function decodeHtmlEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}
