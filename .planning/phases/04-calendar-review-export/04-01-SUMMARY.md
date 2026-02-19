---
phase: 04-calendar-review-export
plan: 01
subsystem: api, ui, database
tags: [drizzle, sveltekit, zod, date-fns, calendar, api-endpoints, post-status]

requires:
  - phase: 03-ai-generation-pipeline
    provides: "AI pipeline functions (generatePostCopy, generatePostImage, getCachedBrandAnalysis, assembleBrief)"
  - phase: 05-dashboard-ui
    provides: "Calendar grid component and page shell with mock data"
provides:
  - "Extended post schema with published status, rejectionReason, publishedAt columns"
  - "PATCH /api/posts/[id] endpoint for post field updates with ownership verification"
  - "POST /api/posts/[id]/regenerate endpoint reusing Phase 3 AI pipeline"
  - "Shared postStatusColors utility for all 6 post statuses"
  - "Calendar page wired to real DB data with month navigation"
affects: [04-02, 04-03]

tech-stack:
  added: []
  patterns:
    - "RequestEvent type from @sveltejs/kit for API endpoint handlers (avoids $types generation timing)"
    - "URL param-based month navigation with goto() for server load re-execution"
    - "Shared post-status color map consumed by calendar grid and sidebar"

key-files:
  created:
    - src/lib/utils/post-status.ts
    - src/routes/api/posts/[id]/+server.ts
    - src/routes/api/posts/[id]/regenerate/+server.ts
    - src/routes/dashboard/calendar/+page.server.ts
  modified:
    - src/lib/server/db/schema.ts
    - src/lib/components/dashboard/calendar-grid.svelte
    - src/routes/dashboard/calendar/+page.svelte
    - messages/en.json
    - messages/es.json

key-decisions:
  - "RequestEvent type instead of generated $types for API endpoints -- avoids build order dependency"
  - "URL search params (?month=YYYY-MM) for calendar month navigation -- enables shareable links and SSR"
  - "Day-selection sidebar replacing mock Today's Queue and AI Suggestions sections"

patterns-established:
  - "Post status color map: centralized in post-status.ts, consumed by all dashboard components"
  - "API ownership verification: load post with product relation, check product.userId === user.id"
  - "Month navigation pattern: URL params + goto() with keepFocus/noScroll for seamless navigation"

requirements-completed: [CALR-01, CALR-02, CALR-03, REVW-05, REVW-06, REVW-07, REVW-08, REVW-09, REVW-10]

duration: 7min
completed: 2026-02-19
---

# Phase 4 Plan 01: Post API + Calendar Data Layer Summary

**PATCH/regenerate API endpoints with Zod validation and ownership checks, calendar page wired to real DB posts with month navigation and status color coding**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-19T16:55:16Z
- **Completed:** 2026-02-19T17:02:42Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Extended posts table with published status, rejectionReason, and publishedAt columns
- Created PATCH endpoint for post updates (status, copy, hashtags, scheduledAt, rejectionReason) with Zod validation and ownership verification
- Created regenerate endpoint reusing Phase 3 AI pipeline functions for single-post copy/image regeneration
- Wired calendar page to real DB data with month range filtering and prev/next navigation
- Replaced mock data sidebar with interactive day-selection post detail view

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend DB schema and create post PATCH + regenerate API endpoints** - `8d6924c` (feat)
2. **Task 2: Wire calendar page to real post data with month navigation** - `b998dfc` (feat)

## Files Created/Modified
- `src/lib/server/db/schema.ts` - Added 'published' to postStatusEnum, rejectionReason and publishedAt columns
- `src/lib/utils/post-status.ts` - Shared PostStatus type and color map for all 6 statuses
- `src/routes/api/posts/[id]/+server.ts` - PATCH endpoint with Zod validation and ownership check
- `src/routes/api/posts/[id]/regenerate/+server.ts` - POST endpoint reusing Phase 3 AI pipeline
- `src/routes/dashboard/calendar/+page.server.ts` - Server load querying posts by month range
- `src/lib/components/dashboard/calendar-grid.svelte` - Rewritten for real post data with status dots
- `src/routes/dashboard/calendar/+page.svelte` - Month navigation, day selection, removed mock imports
- `messages/en.json` - Added 5 calendar navigation i18n keys
- `messages/es.json` - Added 5 calendar navigation i18n keys (Spanish)

## Decisions Made
- Used `RequestEvent` type from `@sveltejs/kit` instead of generated `$types` for API endpoint handlers to avoid build order dependency with type generation
- Calendar month navigation uses URL search params (`?month=YYYY-MM`) with `goto()` for server-side re-execution, enabling shareable calendar URLs
- Replaced mock "Today's Queue" and "AI Suggestions" sidebar sections with interactive day-selection post detail view

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Paraglide v2 message compilation requires Vite build plugin to trigger (standalone `paraglide-js compile` with cleared output directory doesn't regenerate properly). Resolved by running `pnpm build` which triggers the Vite plugin.

## User Setup Required

Database migration needed for new schema columns:
```bash
pnpm drizzle-kit push
```

## Next Phase Readiness
- Post API endpoints ready for review dialog (04-02) to call PATCH for approve/reject and regenerate for re-generation
- Calendar data layer complete for 04-02 to add click-to-review interaction
- Status color map shared utility ready for all Phase 4 UI components

## Self-Check: PASSED

- All 7 key files verified present on disk
- Both task commits (8d6924c, b998dfc) verified in git log
- `npx svelte-check` passes with 0 errors
- `pnpm build` succeeds

---
*Phase: 04-calendar-review-export*
*Completed: 2026-02-19*
