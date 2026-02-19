---
phase: 03-ai-generation-pipeline
plan: 02
subsystem: ai, api, ui
tags: [openai, gpt-4.1, zod, structured-output, sse, background-jobs, svelte5, i18n]

# Dependency graph
requires:
  - phase: 03-ai-generation-pipeline
    provides: generationJobs/contentPlans/posts tables, AI providers, brief assembler
provides:
  - Content plan Zod schemas with structured output validation
  - Plan generation pipeline with 30% promotional cap enforcement
  - POST /api/generate/plan endpoint (fire-and-forget background job)
  - SSE streaming endpoint for real-time job progress
  - Polling fallback endpoint for job status
  - Generate page UI at /dashboard/generate with progress display
  - 19 i18n keys (en/es) for generation flow
affects: [03-03-post-generation, 04-calendar-review-export]

# Tech tracking
tech-stack:
  added: []
  patterns: [Zod structured output with AI SDK generateObject, fire-and-forget background job, SSE progress streaming, polling fallback, Svelte 5 state machine for async flows]

key-files:
  created:
    - src/lib/server/ai/schemas/plan.ts
    - src/lib/server/ai/prompts/plan-system.ts
    - src/lib/server/ai/pipeline/plan-generator.ts
    - src/routes/api/generate/plan/+server.ts
    - src/routes/api/jobs/[id]/stream/+server.ts
    - src/routes/api/jobs/[id]/+server.ts
    - src/routes/dashboard/generate/+page.svelte
    - src/routes/dashboard/generate/+page.server.ts
  modified:
    - src/lib/components/dashboard/sidebar.svelte
    - src/routes/dashboard/+layout.svelte
    - messages/en.json
    - messages/es.json

key-decisions:
  - "AI SDK generateObject with Zod schema for type-safe structured output (not generateText + manual parse)"
  - "Fire-and-forget pattern for background generation to return jobId immediately"
  - "SSE streaming with polling fallback for robust progress reporting"
  - "30% promotional cap with retry + manual reassignment fallback"
  - "Svelte 5 state machine (idle/starting/running/completed/failed) for generation flow"

patterns-established:
  - "Zod schema -> AI SDK generateObject -> validation pipeline for structured LLM output"
  - "Background job pattern: create job record -> fire-and-forget -> poll/stream status"
  - "SSE endpoint pattern: ReadableStream with 1s polling interval, closed flag for cleanup"
  - "Generation page state machine: idle -> starting -> running -> completed/failed"

requirements-completed: [PLAN-01, PLAN-02, PLAN-03, PLAN-04, PLAN-05, PLAN-06, PLAN-07]

# Metrics
duration: 9min
completed: 2026-02-19
---

# Phase 03 Plan 02: Content Plan Generation Summary

**GPT-4.1 plan generation with Zod structured output, background jobs with SSE progress streaming, and generate page UI at /dashboard/generate**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-19T16:15:02Z
- **Completed:** 2026-02-19T16:24:20Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments
- Built plan Zod schemas enforcing 8-12 post slots with content categories, and system/user prompt builders with full brief context injection
- Created plan generator calling GPT-4.1 via AI SDK generateObject with 30% promotional cap validation (retry + manual reassignment fallback)
- Implemented fire-and-forget background job pattern with SSE streaming and polling fallback for real-time progress
- Built generate page at /dashboard/generate with trigger button, step progress bar, existing plans list, and error/retry handling
- Added Generate nav item to sidebar under AI Tools section with 19 new i18n keys (en/es)

## Task Commits

Each task was committed atomically:

1. **Task 1: Plan Zod schemas, system prompt, and plan generator** - `b142b6d` (feat)
2. **Task 2: Background job orchestration, SSE streaming, and API endpoints** - `b057869` (feat)
3. **Task 3: Generate page UI with progress display, sidebar link, and i18n** - `f20781b` (feat)

## Files Created/Modified
- `src/lib/server/ai/schemas/plan.ts` - Zod schemas for content plan structured output (contentPlanSchema, postSlotSchema, contentCategoryZodEnum)
- `src/lib/server/ai/prompts/plan-system.ts` - System and user prompt builders for plan generation with full brief context
- `src/lib/server/ai/pipeline/plan-generator.ts` - Plan generation orchestrator with 30% promo validation and retry logic
- `src/routes/api/generate/plan/+server.ts` - POST endpoint creating job and firing background generation
- `src/routes/api/jobs/[id]/stream/+server.ts` - SSE endpoint for real-time job progress streaming
- `src/routes/api/jobs/[id]/+server.ts` - GET polling fallback for job status
- `src/routes/dashboard/generate/+page.svelte` - Generate page UI with state machine, progress display, existing plans
- `src/routes/dashboard/generate/+page.server.ts` - Server load for product data and existing plans with post counts
- `src/lib/components/dashboard/sidebar.svelte` - Added Generate nav item with Wand2 icon under AI Tools
- `src/routes/dashboard/+layout.svelte` - Added /dashboard/generate to title map
- `messages/en.json` - 19 new gen_* i18n keys
- `messages/es.json` - 19 new gen_* Spanish translations

## Decisions Made
- Used AI SDK `generateObject` with Zod schema for type-safe structured output instead of generateText with manual JSON parsing
- Fire-and-forget pattern returns jobId immediately; background function updates job record as it progresses
- SSE streaming with 1-second polling interval and automatic cleanup on completion/failure
- 30% promotional cap enforced with retry logic: first retry with stricter prompt, then manual reassignment of excess promotional posts to educational
- Svelte 5 state machine pattern (idle/starting/running/completed/failed) for managing async generation flow with SSE + polling fallback

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

OPENAI_API_KEY must be set in .env before triggering plan generation. Key available from: https://platform.openai.com/api-keys
DB migration needed: run `pnpm drizzle-kit push` to apply tables from 03-01.

## Next Phase Readiness
- Content plan generation pipeline fully wired: schemas, prompts, generator, API, UI
- Plan 03 (post generation + image generation) can proceed -- it will consume the content plan and generate individual post copy + images
- All endpoints auth-protected and product-ownership verified

## Self-Check: PASSED

All 8 created files verified present. All 3 task commits (b142b6d, b057869, f20781b) verified in git log.

---
*Phase: 03-ai-generation-pipeline*
*Completed: 2026-02-19*
