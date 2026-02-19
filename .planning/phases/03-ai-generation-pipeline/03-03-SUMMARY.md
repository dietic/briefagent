---
phase: 03-ai-generation-pipeline
plan: 03
subsystem: ai, api, ui
tags: [openai, gpt-4.1-mini, gpt-image-1, vision, sharp, brand-analysis, copy-generation, image-generation, zod, structured-output, supabase-storage]

# Dependency graph
requires:
  - phase: 03-ai-generation-pipeline
    provides: AI providers (copyModel, analysisModel, imageModel), brief assembler, generationJobs/contentPlans/posts tables, plan generation pipeline, SSE/polling endpoints, generate page UI
provides:
  - Brand analysis via GPT-4.1-mini vision with per-product caching
  - Copy generation with LinkedIn-optimized structured output (hook, body, CTA, hashtags)
  - Image generation with Sharp 1200x1200 resize and Supabase Storage upload
  - Post generation orchestrator with batched copy (3 concurrent) and sequential images
  - POST /api/generate/posts endpoint (fire-and-forget background job)
  - Generate page "Generate Posts" button per plan with SSE progress
  - 8 new i18n keys (en/es) for post generation UI
affects: [04-calendar-review-export]

# Tech tracking
tech-stack:
  added: []
  patterns: [Vision API for brand asset analysis with jsonb caching, batched AI calls with rate limit delays, sequential image generation with Sharp resize pipeline, structured output for LinkedIn copy]

key-files:
  created:
    - src/lib/server/ai/schemas/brand-analysis.ts
    - src/lib/server/ai/schemas/copy.ts
    - src/lib/server/ai/prompts/brand-analysis.ts
    - src/lib/server/ai/prompts/copy-system.ts
    - src/lib/server/ai/prompts/image-system.ts
    - src/lib/server/ai/pipeline/brand-analyzer.ts
    - src/lib/server/ai/pipeline/copy-generator.ts
    - src/lib/server/ai/pipeline/image-generator.ts
    - src/lib/server/ai/pipeline/post-generator.ts
    - src/routes/api/generate/posts/+server.ts
  modified:
    - src/lib/server/db/schema.ts
    - src/routes/dashboard/generate/+page.svelte
    - src/routes/dashboard/generate/+page.server.ts
    - messages/en.json
    - messages/es.json

key-decisions:
  - "generateText with Output.object for brand analysis (vision + structured output in one call)"
  - "Per-product brandAnalysis jsonb caching to avoid repeated vision API calls"
  - "Copy generation via AI SDK structured output with LinkedIn-specific rules in system prompt"
  - "Image generation with gpt-image-1 at 1024x1024, resized to 1200x1200 via Sharp for LinkedIn"
  - "Separate 'generated-images' Supabase Storage bucket from user 'assets' bucket"
  - "Batched copy (3 concurrent, 200ms delay) and sequential images (1 at a time, 500ms delay) for rate limiting"

patterns-established:
  - "Brand analysis caching: vision API result stored as jsonb on product record, checked before re-analysis"
  - "Copy prompt pattern: system prompt with full brief context + user prompt with per-post slot details"
  - "Image pipeline: generate -> buffer -> Sharp resize -> Supabase Storage upload -> return public URL"
  - "Post orchestrator: sequential phases (brief -> brand -> copy batches -> images) with job progress updates"

requirements-completed: [COPY-01, COPY-02, COPY-03, COPY-04, IMGN-01, IMGN-02, IMGN-03, IMGN-04]

# Metrics
duration: 4min
completed: 2026-02-19
---

# Phase 03 Plan 03: Post Generation Pipeline Summary

**Brand vision analysis with caching, LinkedIn-optimized copy generation, gpt-image-1 image creation with Sharp 1200x1200 resize, and post orchestrator with batched/sequential rate-limited generation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-19T16:27:06Z
- **Completed:** 2026-02-19T16:31:49Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Built brand analyzer using GPT-4.1-mini vision to extract visual identity (colors, style, mood, patterns) from uploaded assets, with per-product jsonb caching
- Created copy generator producing LinkedIn-optimized structured output: hook line, body, CTA, 3-5 hashtags (popular + niche mix), and complete formatted text
- Implemented image generator using gpt-image-1 at 1024x1024, resized to 1200x1200 via Sharp, uploaded to separate 'generated-images' Supabase Storage bucket
- Built post orchestrator processing copy in batches of 3 (200ms delay) and images sequentially (500ms delay) with real-time job progress updates
- Added POST /api/generate/posts endpoint with auth + ownership verification and fire-and-forget background job
- Updated generate page with "Generate Posts" button per plan, SSE progress for post generation, and "Posts generated" badge with count

## Task Commits

Each task was committed atomically:

1. **Task 1: Brand analyzer, copy generator, and image generator with schemas and prompts** - `2247b20` (feat)
2. **Task 2: Post generation orchestrator, API endpoint, and UI updates** - `42ad67e` (feat)

## Files Created/Modified
- `src/lib/server/ai/schemas/brand-analysis.ts` - Zod schema for brand analysis structured output (colors, style, mood, patterns, imageStyleGuide)
- `src/lib/server/ai/schemas/copy.ts` - Zod schema for copy output (hookLine, body, cta, hashtags, fullText)
- `src/lib/server/ai/prompts/brand-analysis.ts` - System prompt for GPT-4.1-mini vision brand analysis
- `src/lib/server/ai/prompts/copy-system.ts` - System + user prompt builders for LinkedIn copy generation with brief context
- `src/lib/server/ai/prompts/image-system.ts` - Image prompt builder incorporating brand analysis guidelines
- `src/lib/server/ai/pipeline/brand-analyzer.ts` - analyzeBrandAssets (vision) + getCachedBrandAnalysis (with jsonb cache)
- `src/lib/server/ai/pipeline/copy-generator.ts` - generatePostCopy with structured output via AI SDK
- `src/lib/server/ai/pipeline/image-generator.ts` - generatePostImage with Sharp resize + Supabase Storage upload
- `src/lib/server/ai/pipeline/post-generator.ts` - generatePostsForPlan orchestrator (brief -> brand -> copy batches -> images)
- `src/routes/api/generate/posts/+server.ts` - POST endpoint for triggering post generation
- `src/lib/server/db/schema.ts` - Added brandAnalysis jsonb column to products table
- `src/routes/dashboard/generate/+page.svelte` - Added "Generate Posts" button, post gen progress, "Posts generated" badge
- `src/routes/dashboard/generate/+page.server.ts` - Added postsGenerated and generatedPostCount to plan data
- `messages/en.json` - 8 new gen_posts_* i18n keys
- `messages/es.json` - 8 new gen_posts_* Spanish translations

## Decisions Made
- Used `generateText` with `Output.object` for brand analysis since vision + structured output need message-based API (not `generateObject` which uses prompt)
- Per-product brandAnalysis jsonb caching avoids repeated vision API calls across generation runs
- Separate 'generated-images' Supabase Storage bucket keeps AI-generated content distinct from user uploads
- Batched copy generation (3 concurrent) balances speed with rate limits; sequential image generation (1 at a time) respects slower image API
- Default brand analysis fallback for products with no uploaded assets ensures generation still works

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

- OPENAI_API_KEY must be set in .env before triggering post generation
- DB migration needed: `pnpm drizzle-kit push` to apply brandAnalysis column
- Create 'generated-images' bucket in Supabase Storage dashboard (or it will be auto-created on first upload if using service role)

## Next Phase Readiness
- Phase 3 (AI Generation Pipeline) is now COMPLETE: all 3 plans executed
- Full pipeline: brief assembly -> content plan generation -> per-post copy + image generation
- Phase 4 (Calendar, Review & Export) can proceed -- all generated content is in the posts table with status 'pending_review'
- Posts have copyText, hashtags, imageUrl, imagePrompt, and status fields populated

## Self-Check: PASSED

All 10 created files verified present. Both task commits (2247b20, 42ad67e) verified in git log.

---
*Phase: 03-ai-generation-pipeline*
*Completed: 2026-02-19*
