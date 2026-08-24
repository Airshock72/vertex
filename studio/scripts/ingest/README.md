# Video ingestion pipeline

Offline tooling that builds `video` documents from YouTube transcripts and chapter markers. Run from the `studio/` workspace.

## Three-step workflow

```bash
# 1. Fetch transcripts and chapters (resumes from cache; --force re-fetches everything)
npm run ingest:videos

# 2. Validate cache and write videos.ndjson
npm run ingest:build

# 3. Import into Sanity (replace existing video documents)
npm run ingest:import
```

For a smoke run on the first N videos:

```bash
npm run ingest:videos -- --limit=3
```

## What each file does

| File | Purpose |
|------|---------|
| `ingest-videos.mjs` | Runner: queries lessons, dedupes by video id, fetches from provider, writes to cache |
| `build-ndjson.mjs` | Validates cache files, writes `videos.ndjson` |
| `parse-video-url.mjs` | Provider + video id from a lesson `videoUrl` (mirrors `lib/video.ts`) |
| `chunk.mjs` | Merges raw cues into ~45 s / ~350 char timestamped chunks |
| `providers/youtube.mjs` | YouTube: chapters from `ytInitialData`, cues via InnerTube iOS player |

## Cache

Cached data lives in `.cache/<docId>.json` (gitignored). Each file is a single video's chapters and chunks. Re-running with no `--force` reads the cache and makes zero network requests.

Generated `videos.ndjson` is also gitignored — regenerate it with `npm run ingest:build`.

## Supported providers

| Provider | Ingestion | Playback |
|----------|-----------|---------|
| YouTube | ✅ | ✅ |
| Vimeo | ❌ needs `/texttracks` API token | ✅ |
| Bunny | ❌ needs stream API key | ✅ |

Adding a new provider means creating `providers/<name>.mjs` exporting `fetch<Name>(id)` and registering it in `ingest-videos.mjs`. Both ingestion and playback must exist before a provider is considered supported (AGENTS.md §9).

## Common failures

**`No caption tracks returned by InnerTube`** — the video may be private, age-restricted, or have captions disabled. Confirm the video is public and captioned.

**`InnerTube player returned 429`** — rate-limited. The runner already throttles at 1.5 s between videos; wait a few minutes and re-run (cache means you only retry the failed ones).

**`Could not parse lesson query output`** — the Sanity CLI may need `sanity login` or the dataset name in `.env` may not match. Check `SANITY_STUDIO_DATASET`.

**Validation errors in `ingest:build`** — a cache file is corrupt (e.g. a partial write from a killed run). Delete the offending `.cache/<docId>.json` and re-run `ingest:videos`.
