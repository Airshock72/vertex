#!/usr/bin/env node
// Fetches transcripts and chapters for every unique lesson video and persists them to
// .cache/<docId>.json. Re-runs are safe: cached entries are skipped unless --force is passed.
//
// Usage (run from studio/):
//   npm run ingest:videos              # all videos
//   npm run ingest:videos -- --limit=3 # smoke run, first 3 unique videos
//   npm run ingest:videos -- --force   # re-fetch everything

import { execSync } from 'node:child_process'
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseVideoUrl, videoDocId } from './parse-video-url.mjs'
import { fetchYouTube } from './providers/youtube.mjs'
import { chunkCues } from './chunk.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_DIR = join(__dirname, '.cache')
const THROTTLE_MS = 1500

const args = process.argv.slice(2)
const force = args.includes('--force')
const limitArg = args.find((a) => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  mkdirSync(CACHE_DIR, { recursive: true })

  // Fetch all lesson videoUrls via the Sanity CLI (uses stored CLI auth — no token needed)
  let raw
  try {
    raw = execSync(
      `npx sanity documents query '*[_type == "lesson" && defined(videoUrl)]{videoUrl}' --dataset development`,
      { cwd: join(__dirname, '../..'), encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
    )
  } catch (err) {
    console.error('Failed to query lessons from Sanity:')
    console.error(err.stderr || err.message)
    process.exit(1)
  }

  let lessons
  try {
    lessons = JSON.parse(raw)
  } catch {
    console.error('Could not parse lesson query output. Raw output:')
    console.error(raw.slice(0, 500))
    process.exit(1)
  }

  if (!Array.isArray(lessons)) {
    console.error('Expected an array of lessons, got:', typeof lessons)
    process.exit(1)
  }

  // Deduplicate by (provider, videoId) — two lessons may share the same video
  const seen = new Map()
  for (const { videoUrl } of lessons) {
    if (!videoUrl) continue
    const parsed = parseVideoUrl(videoUrl)
    if (!parsed) {
      console.warn(`  skip (unparseable URL): ${videoUrl}`)
      continue
    }
    const docId = videoDocId(parsed.provider, parsed.id)
    if (!seen.has(docId)) seen.set(docId, { ...parsed, url: videoUrl, docId })
  }

  const total = seen.size
  const videos = [...seen.values()].slice(0, limit)
  const runCount = videos.length

  console.log(
    `Found ${total} unique video(s)` +
    (runCount < total ? `, running first ${runCount}` : '') +
    (force ? ' (--force: re-fetching all)' : ''),
  )

  const failures = []

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i]
    const cacheFile = join(CACHE_DIR, `${v.docId}.json`)
    const prefix = `[${i + 1}/${runCount}] ${v.docId}`

    if (!force && existsSync(cacheFile)) {
      console.log(`${prefix}  cached`)
      continue
    }

    if (v.provider !== 'youtube') {
      console.warn(
        `${prefix}  skipped — ingestion not yet implemented for "${v.provider}". ` +
        `Both ingestion and playback must exist before a provider is supported (see AGENTS.md §9).`,
      )
      continue
    }

    try {
      process.stdout.write(`${prefix}  fetching…`)
      const { chapters, cues } = await fetchYouTube(v.id)

      if (cues.length === 0) {
        failures.push({ docId: v.docId, reason: 'no transcript cues returned' })
        console.log(`  FAIL — no cues`)
        continue
      }

      const chunks = chunkCues(cues)
      const chaptersKeyed = chapters.map((c) => ({
        _key: `chapter-${c.startSeconds}`,
        startSeconds: c.startSeconds,
        label: c.label,
      }))

      const doc = {
        docId: v.docId,
        url: v.url,
        provider: v.provider,
        id: v.id,
        chapters: chaptersKeyed,
        chunks,
        ingestedAt: new Date().toISOString(),
      }

      writeFileSync(cacheFile, JSON.stringify(doc, null, 2), 'utf-8')
      console.log(`  ok — ${chaptersKeyed.length} chapters, ${chunks.length} chunks`)

      if (i < videos.length - 1) await sleep(THROTTLE_MS)
    } catch (err) {
      failures.push({ docId: v.docId, reason: err.message })
      console.log(`  FAIL — ${err.message}`)
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} failure(s):`)
    for (const f of failures) console.error(`  ${f.docId}: ${f.reason}`)
    process.exit(1)
  }

  console.log('\nDone.')
}

main()
