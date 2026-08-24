#!/usr/bin/env node
// Converts .cache/<docId>.json files produced by ingest-videos.mjs into
// videos.ndjson for import with `sanity dataset import`.
//
// Validates every document before writing: well-formed ids, non-negative integer
// startSeconds, monotonically increasing order, non-empty text. Exits non-zero
// if any document fails validation.
//
// Usage (run from studio/):
//   npm run ingest:build

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_DIR = join(__dirname, '.cache')
const OUT_FILE = join(__dirname, 'videos.ndjson')

const ID_PATTERN = /^[A-Za-z0-9._-]+$/

function validate(doc, errors) {
  // Document id
  const docId = `video.${doc.provider}-${doc.id.replace(/[^A-Za-z0-9._-]/g, '')}`
  if (!ID_PATTERN.test(docId)) {
    errors.push(`${doc.docId}: derived id "${docId}" contains invalid characters`)
  }

  // Chapters
  let prevChapter = -1
  for (const c of doc.chapters ?? []) {
    if (!Number.isInteger(c.startSeconds) || c.startSeconds < 0) {
      errors.push(`${doc.docId}: chapter startSeconds "${c.startSeconds}" is not a non-negative integer`)
    }
    if (c.startSeconds <= prevChapter) {
      errors.push(`${doc.docId}: chapters are not monotonically increasing (${prevChapter} → ${c.startSeconds})`)
    }
    if (!c.label || !c.label.trim()) {
      errors.push(`${doc.docId}: chapter at ${c.startSeconds}s has empty label`)
    }
    prevChapter = c.startSeconds
  }

  // Chunks
  let prevChunk = -1
  for (const c of doc.chunks ?? []) {
    if (!Number.isInteger(c.startSeconds) || c.startSeconds < 0) {
      errors.push(`${doc.docId}: chunk startSeconds "${c.startSeconds}" is not a non-negative integer`)
    }
    if (c.startSeconds < prevChunk) {
      errors.push(`${doc.docId}: chunks are not monotonically non-decreasing (${prevChunk} → ${c.startSeconds})`)
    }
    if (!c.text || !c.text.trim()) {
      errors.push(`${doc.docId}: chunk at ${c.startSeconds}s has empty text`)
    }
    prevChunk = c.startSeconds
  }

  if ((doc.chunks ?? []).length === 0) {
    errors.push(`${doc.docId}: has zero chunks`)
  }
}

function toSanityDoc(doc) {
  return {
    _id: doc.docId,
    _type: 'video',
    videoId: doc.id,
    url: doc.url,
    provider: doc.provider,
    chapters: doc.chapters ?? [],
    chunks: doc.chunks ?? [],
    ingestedAt: doc.ingestedAt,
  }
}

function main() {
  let files
  try {
    files = readdirSync(CACHE_DIR).filter((f) => f.endsWith('.json'))
  } catch {
    console.error(`Cache directory not found: ${CACHE_DIR}`)
    console.error('Run `npm run ingest:videos` first.')
    process.exit(1)
  }

  if (files.length === 0) {
    console.error('No cache files found. Run `npm run ingest:videos` first.')
    process.exit(1)
  }

  const docs = []
  const errors = []
  let loadErrors = 0

  for (const file of files) {
    const filePath = join(CACHE_DIR, file)
    let doc
    try {
      doc = JSON.parse(readFileSync(filePath, 'utf-8'))
    } catch (err) {
      errors.push(`${file}: failed to parse — ${err.message}`)
      loadErrors++
      continue
    }
    validate(doc, errors)
    docs.push(doc)
  }

  if (errors.length > 0) {
    console.error(`Validation failed with ${errors.length} error(s):`)
    for (const e of errors) console.error(`  ${e}`)
    process.exit(1)
  }

  const ndjson = docs.map((d) => JSON.stringify(toSanityDoc(d))).join('\n') + '\n'
  writeFileSync(OUT_FILE, ndjson, 'utf-8')

  console.log(`Wrote ${docs.length} video document(s) to ${OUT_FILE}`)
}

main()
