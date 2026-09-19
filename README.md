# Vertex

Vertex is a learning platform. Authors create courses in Sanity, and a Next.js 
site serves them to learners. What sets it apart is search. A learner types a plain 
language query and gets back ranked, clickable cards. Each card links straight to the
exact second in a lesson's video where that topic is taught,
and the video plays on the site itself.

- **Catalog, course, lesson, and instructor pages** rendered from structured Sanity content.
- **Authentication & accounts** via Clerk; browsing is public, protected surfaces are gated in middleware.
- **Learner progress** — completed lessons and resume position, keyed to the Clerk user id.
- **Product analytics** via PostHog (catalog/lesson views, searches, video plays and watch depth, completions).
- **Intelligent search** — the Sanity Context MCP + an LLM turn a query into GROQ over the schema and
  return structured **video-moment** and **lesson** result cards, grounded strictly in real data.
- **Two-stage timestamp resolution** — match a video's chapters first, fall back to the transcript —
  with on-site, deep-linked playback that seeks the embedded player to the matched second.
- **Offline video ingestion** — a pipeline that pulls transcripts and chapters into `video` documents.

## Repository layout

This is **two standalone workspaces in one repo** — deployed independently.

| Path | Workspace | What it holds |
|------|-----------|---------------|
| `/` (root) | **Web** — Next.js App Router | Pages, the search UI + API route, Clerk/PostHog wiring, the server-only Sanity data layer |
| `/studio` | **Studio** — Sanity | Content schema, authoring, the search Context document, and the video ingestion scripts |

Key web directories: `app/` (routes), `components/`, `lib/` (`lib/search/*` for the search backend,
`lib/video.ts` for embed/seek), `sanity/` (server-only client, queries, image helpers).

## Tech stack

- **Next.js 16 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS** (with typography)
- **Clerk** — authentication, wired through Next.js middleware
- **PostHog** — product analytics (`posthog-js` in the browser, `posthog-node` on the server)
- **Sanity** Studio + `next-sanity`, `@sanity/image-url`, `@portabletext/react`
- **Sanity Context MCP** (server-side HTTP) + **Vercel AI SDK** (`ai`) with the **OpenAI or Anthropic** provider
- **Zod** for validating structured model output; **react-markdown** for the search reply only

## Prerequisites

- **Node.js 20+** (developed on Node 24) and **npm**
- A **Sanity** account and project (`sanity` CLI is installed with the Studio workspace)
- A **Clerk** application (publishable + secret keys)
- An **LLM key** — OpenAI **or** Anthropic — for search
- A **Sanity Context MCP URL** for search (requires a *deployed* Studio — see below)
- Optional: a **PostHog** project for analytics

## Setup from scratch (after cloning)

```bash
git clone <your-repo-url> vertex
cd vertex
```

### 1. Install dependencies (both workspaces)

```bash
npm install            # web (repo root)
cd studio && npm install && cd ..
```

### 2. Create the Sanity project & log in

```bash
cd studio
npx sanity login
npx sanity init --env        # creates/links a project; note the projectId and choose a dataset
cd ..
```

Use one dataset name consistently (e.g. `production`) across both workspaces.

### 3. Configure environment variables

Copy the example files and fill them in. `.env.example` in each workspace is the canonical list of keys.

```bash
cp .env.example .env.local            # web
cp studio/.env.example studio/.env.local
```

**Web (`.env.local`)** — highlights (see `.env.example` for the full list):

- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_API_READ_TOKEN` — server-only Viewer token for the private dataset
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (+ the sign-in/up URL vars)
- `NEXT_PUBLIC_POSTHOG_*` (optional analytics)
- `SANITY_CONTEXT_MCP_URL` — the Context MCP endpoint for search
- `SEARCH_PROVIDER` (`openai` | `anthropic`) + the matching `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`;
  optional `SEARCH_MODEL` override

**Studio (`studio/.env.local`)** — must point at the **same** Sanity project:

- `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`

> Keep secrets server-side. Only `NEXT_PUBLIC_*` values reach the browser; the Sanity read token,
> Clerk secret, and any LLM key stay on the server.

### 4. Seed content & generate types (Studio)

```bash
cd studio
npm run seed:import          # imports sample content into the "development" dataset
# or: npm run seed:import:prod  (imports into "production" with --replace)
npm run typegen              # extracts the schema and regenerates ../sanity.types.ts
```

### 5. Deploy the Studio (required for search)

The Context MCP only serves a dataset that has a **deployed Studio application**:

```bash
npm run deploy               # deploys the Studio app
npm run context:import       # imports the search Context document (scope filter + instructions)
cd ..
```

Run the Studio locally for authoring with `cd studio && npm run dev` (default `http://localhost:3333`).

### 6. (Optional) Ingest video transcripts

Builds `video` documents (chapters + timestamped transcript chunks) so search can return video
moments. YouTube ingestion is implemented; Vimeo/Bunny play back but aren't ingested yet. See
`studio/scripts/ingest/README.md`.

```bash
cd studio
npm run ingest:videos        # fetch transcripts + chapters (cached; add -- --limit=3 for a smoke run)
npm run ingest:build         # validate cache → videos.ndjson
npm run ingest:import        # import into Sanity
cd ..
```

### 7. Run the web app

```bash
npm run dev                  # from the repo root
```

Open **http://localhost:3000**.

## Everyday commands

**Web (repo root):**

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

**Studio (`studio/`):** `npm run dev`, `npm run build`, `npm run deploy`, `npm run typegen`,
`npm run seed:import[:prod]`, `npm run context:import`, `npm run ingest:videos|build|import`.

## How search works (in brief)

1. The browser posts a query to `POST /api/search` (a server route — no token or LLM key in the browser).
2. The route connects to the **Sanity Context MCP**, injects the schema + system prompt, and calls the LLM.
3. The LLM writes GROQ (matching lesson topics, and video chapters → transcript chunks) via the MCP.
4. Results are grounded against real content and returned as ranked **lesson** and **video-moment** cards.
5. A video card deep-links to `/lessons/<slug>?t=<seconds>`; the embedded player seeks to that second.

Search config lives in two places, kept in sync: the inline system prompt (`lib/search/system-prompt.ts`)
and the Studio Context document (`studio/scripts/context/vertex-search.ndjson`). The route caches the
initial context, so instruction/prompt changes take effect after a server restart.

## Notes & gotchas

- The dataset is **private** — all content is fetched server-side with the read token.
- The Context MCP needs a **deployed Studio**, not just a schema.
- If `text::semanticSimilarity()` errors with embeddings disabled, search falls back to wildcard keyword matching.
- Search needs a funded LLM account; switch providers with `SEARCH_PROVIDER` without code changes.

