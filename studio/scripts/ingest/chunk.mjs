// Merge raw caption cues into timestamped chunks suitable for storage.
// Breaks at ~45 s elapsed or ~350 characters, whichever comes first.

const MAX_SECONDS = 45
const MAX_CHARS = 350

/**
 * @param {Array<{start: number, text: string}>} cues
 * @returns {Array<{_key: string, startSeconds: number, text: string}>}
 */
export function chunkCues(cues) {
  const chunks = []
  let current = null

  for (const cue of cues) {
    const text = decodeHtmlEntities(cue.text).replace(/\s+/g, ' ').trim()
    if (!text) continue

    if (!current) {
      current = { start: Math.floor(cue.start), parts: [text] }
    } else {
      const elapsed = cue.start - current.start
      const projected = current.parts.join(' ').length + 1 + text.length
      if (elapsed >= MAX_SECONDS || projected > MAX_CHARS) {
        chunks.push(current)
        current = { start: Math.floor(cue.start), parts: [text] }
      } else {
        current.parts.push(text)
      }
    }
  }

  if (current) chunks.push(current)

  return chunks.map((c, i) => ({
    _key: `chunk-${i}`,
    startSeconds: c.start,
    text: c.parts.join(' '),
  }))
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
