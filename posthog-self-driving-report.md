# PostHog Self-driving setup — Vertex

## Summary

PostHog Self-driving has been configured for Vertex: session replay, error tracking, and
support are enabled; six native signal sources are wired to the inbox; a 6-scout troop is
running (4 built-in + 2 custom for lesson completion and search quality); and two Replay
Vision scanners are armed on course/lesson pages and rage-click sessions. Findings will
start appearing in the [Self-driving inbox](https://eu.posthog.com/project/101384/inbox)
within ~30 minutes.

---

## AI data processing

Approved. Organization-level AI data processing consent was granted before this run.

---

## GitHub

Connected during this run — GitHub App installed by Gela Lomidze (Airshock72), integration
ID 79617, created 2026-08-23.

---

## Products enabled

| Product | Status | Notes |
|---|---|---|
| Session Replay | Disabled (local override) | `disable_session_recording: true` in `instrumentation-client.ts` overrides the server enable |
| Error Tracking | Disabled (local override) | `capture_exceptions: false` in `instrumentation-client.ts` overrides the server enable |
| Support (Conversations) | Disabled (local override) | `disable_conversations: true` in `instrumentation-client.ts`; tickets require an inbound channel — see Follow-ups |

To re-enable any product, remove its corresponding override from `instrumentation-client.ts`.

---

## Signal sources

| Source product | Source type | Action |
|---|---|---|
| `signals_scout` | `cross_source_issue` | On by default — no row needed |
| `health_checks` | `health_issue` | Enabled (new) — id `01a02edb-2571-7e34-99aa-cc6322090b90` |
| `error_tracking` | `issue_created` | Enabled (new) — id `01a02edb-271a-7d0e-9af3-934db4bc35bb` |
| `error_tracking` | `issue_reopened` | Enabled (new) — id `01a02edb-2d2b-71e8-9d65-2b545941e127` |
| `error_tracking` | `issue_spiking` | Enabled (new) — id `01a02edb-2ff1-7267-8b3a-e56c12839472` |
| `session_replay` | `session_analysis_cluster` | Enabled (new, `sample_rate: 0.1`) — id `01a02edb-3458-783d-8345-53ec41220c9b` |
| `conversations` | `ticket` | Enabled (new) — id `01a02edb-357d-70cd-ab25-0596759ae918` |
| `replay_vision` | — | Self-authorizing via scanner `emits_signals` flag — no row needed |

---

## Connected tools

| Tool | Status |
|---|---|
| GitHub Issues | Not used (skipped at user selection) |
| Linear | Not used |
| Jira | Not used |
| Sentry | Not used |
| Zendesk | Not used |

---

## Scout troop

**Run budget:** 100 runs/day (confirmed via `scout-metadata-get`), 0 runs used today.
Banner: *"Scouts are in early access. Each project gets up to 100 scout runs a day.
Contact team-self-driving@posthog.com if you need more."*

### Enabled (6)

| Scout | What it watches |
|---|---|
| `signals-scout-general` | Cross-product correlations and surfaces no specialist covers |
| `signals-scout-product-analytics` | Funnels, retention, lifecycle, and stickiness regressions on saved insights |
| `signals-scout-web-analytics` | Per-channel session volume, attribution breakage, and landing-page health |
| `signals-scout-health-checks` | PostHog setup health (instrumentation gaps, proxy, SDK currency) |
| `signals-scout-lesson-completion` *(custom)* | `lesson_view → video_play → lesson_completed` completion rate |
| `signals-scout-search-quality` *(custom)* | `search_performed` zero-result rate and avg result count |

### Disabled (23)

| Scout | Reason disabled |
|---|---|
| `signals-scout-error-tracking` | **Covered by the native error tracking source** — not a re-enable candidate |
| `signals-scout-session-replay` | **Covered by the native session replay source** — not a re-enable candidate |
| `signals-scout-feature-flags` | No PostHog feature flags in use (Clerk handles access control) |
| `signals-scout-surveys` | No surveys configured |
| `signals-scout-revenue-analytics` | No payment SDK or revenue events |
| `signals-scout-ai-observability` | LLM search not yet instrumented with `$ai_*` events |
| `signals-scout-experiments` | No A/B experiments running |
| `signals-scout-replay-vision` | No accumulated scanner observations yet (created this run) |
| `signals-scout-inbox-validation` | No shipped fixes to validate on a fresh setup |
| All others | Surface not in active use |

Enable any from PostHog → inbox settings as the product expands.

**Noise escape hatch:** set `emit: false` on any scout's config in PostHog to switch it to
dry-run (runs and logs, but writes nothing to the inbox).

---

## Custom scouts

Two custom scouts were created after a gap analysis against the built-in troop.

### `signals-scout-lesson-completion`

- **Watches:** the core learning loop — `lesson_viewed → video_play → lesson_completed`
- **Discriminator:** completion rate (`lesson_completed / lesson_viewed`) dropping
  week-over-week while views stay flat or rise; a parallel drop in both means capture
  regression, not a content problem
- **Why no built-in covers it:** `signals-scout-product-analytics` only fires on saved
  PostHog funnels; this project has none yet. The custom scout watches raw events directly.
- **Thresholds:** ≥ 15% WoW drop with flat/rising views; or any lesson with > 20 views and
  < 30% completion; or a video-play gap (many lesson views, very few video plays)

### `signals-scout-search-quality`

- **Watches:** `search_performed` events — zero-result rate and average results per search
- **Discriminator:** zero-result rate ≥ 25% in 7d, or ≥ 15 pp WoW increase; or avg result
  count dropping ≥ 30% WoW with no volume explanation
- **Why no built-in covers it:** the AI-powered search (Sanity Context MCP + LLM returning
  ranked video-moment and lesson cards) is the platform's core differentiator; no built-in
  scout watches search event quality
- **Also watches:** most common zero-result query strings (content gap vs. systemic failure)

### Surfaces ruled out

| Surface | Filter that killed it |
|---|---|
| Video watch depth (`video_play` + progress) | Uncertain whether a per-tick progress event exists yet — no clear watchable surface |
| Enrollment/purchase conversion | No explicit enrollment event defined in the codebase |

---

## Replay Vision scanners

Replay Vision scanners are LLMs that watch individual session recordings on a schedule
and push findings to the Self-driving inbox. Findings arrive at **half weight** — they
need corroboration from a second independent finding before they're promoted into a full
inbox report. Both scanners are armed; they start working the day recordings arrive (the
project currently has no recordings).

| Scanner | Query scope | Sampling rate | Est. monthly credits |
|---|---|---|---|
| Lesson video and content breakage | `$current_url icontains /courses/` | 0.5 | 0 (no recordings) |
| Learner frustration and navigation blocks | `$rageclick` gate only | 1.0 | 0 (no recordings) |

**Lesson video and content breakage** — watches `/courses/` sessions (course detail +
lesson pages, the core completion flow) for: a blank video embed, lesson content failing
to load, Start/Next Lesson buttons doing nothing, and the search page returning an error.
URL-scoped to stay on the completion flow (disjointness rule: URL axis).

**Learner frustration and navigation blocks** — watches any session containing a rage-click
for: a video that won't start at the right timestamp, repeated fruitless searches, an
unresponsive Next Lesson link, and a lesson completion checkbox that won't register.
Gated on `$rageclick` only (disjointness rule: event axis).

Credit spend was not pre-verified (`creating-replay-vision-scanners` skill not on this
deploy). Estimated monthly credits are 0 for both — no recordings exist yet.

---

## Follow-ups

- [ ] **Connect a Support inbound channel** — Conversations is on, but tickets only arrive
      once you connect email, inbox, or Slack in PostHog → Support settings.
- [ ] **Enable `signals-scout-ai-observability`** — once the LLM-powered search is
      instrumented with `$ai_*` events (Vercel AI SDK + OpenAI provider, planned in
      AGENTS.md), enable this scout from inbox settings to watch LLM cost, latency, and
      error rates.
- [ ] **Add a video watch-depth event** — if `video_play` events gain a watch-progress
      property (or a separate progress-tick event is added), a scout watching average
      watch depth per lesson would add meaningful signal.
- [ ] **Save a PostHog funnel** — once traffic grows, create a saved funnel
      (search_performed → lesson_view → lesson_completed) in PostHog so
      `signals-scout-product-analytics` can monitor it automatically alongside the custom
      lesson-completion scout.

---

## What happens next

The scout coordinator picks up fresh configs within ~30 minutes. Each run draws from
the project's daily budget (100 runs/day during early access). Findings cluster into
reports in the [Self-driving inbox](https://eu.posthog.com/project/101384/inbox);
immediately-actionable ones can auto-start coding tasks.
