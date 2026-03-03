---
phase: 09-pillar-system-rework-make-pillars-universal-multi-platform-per-pillar-dedicated-management-page-ai-pipeline-adaptation
plan: 01
subsystem: database, ai, ui
tags: [drizzle, junction-table, multi-platform, pillars, sveltekit, ai-pipeline]

# Dependency graph
requires:
  - phase: 07-content-pillars
    provides: "Content pillars schema, Deep Brief UI, pillar-aware generation"
  - phase: 08-platform-selection
    provides: "Platform specs, single-platform per pillar, platform-aware AI pipeline"
provides:
  - "pillar_platforms junction table for many-to-many pillar-platform relationships"
  - "AssembledBrief.contentPillars[].platforms as string[] (not single platform)"
  - "AI plan prompt with ONE post PER PLATFORM per pillar instruction"
  - "Dynamic minPosts/maxPosts calculation from pillar-platform combinations"
  - "Universal Content Pillars section for all product types in Deep Brief"
  - "Multi-platform toggle chips per pillar card"
affects: [09-02-pillars-page, generate-page, settings-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Junction table pattern for many-to-many relationships with Drizzle"
    - "Toggle chip UI pattern for multi-select instead of dropdown"

key-files:
  created:
    - "src/lib/server/db/migrations/0005_crazy_champions.sql"
  modified:
    - "src/lib/server/db/schema.ts"
    - "src/lib/server/ai/pipeline/brief-assembler.ts"
    - "src/lib/server/ai/prompts/plan-system.ts"
    - "src/lib/server/ai/pipeline/plan-generator.ts"
    - "src/routes/dashboard/onboarding/deep-brief/+page.svelte"
    - "src/routes/dashboard/onboarding/deep-brief/+page.server.ts"
    - "src/routes/dashboard/generate/+page.server.ts"
    - "src/routes/dashboard/generate/+page.svelte"
    - "src/routes/dashboard/settings/[id]/+page.server.ts"
    - "src/routes/dashboard/settings/[id]/+page.svelte"
    - "messages/en.json"
    - "messages/es.json"

key-decisions:
  - "Junction table pillar_platforms replaces single platform column for many-to-many"
  - "Data migration via INSERT...SELECT preserves existing platform assignments"
  - "Content Pillars section universal for all product types, not gated behind personal_brand"
  - "Product details section shown alongside pillars for product/service types (not exclusive)"
  - "Toggle chips for multi-platform selection instead of single-select dropdown"

patterns-established:
  - "Junction table with cascade delete for many-to-many relationships"
  - "Multi-platform toggle chip UI: togglePlatform function with array spread for reactivity"
  - "Product details as separate conditional section (1b) shown alongside universal pillars"

requirements-completed: []

# Metrics
duration: 10min
completed: 2026-03-03
---

# Phase 9 Plan 1: Schema + Pipeline + Deep Brief Summary

**Junction table pillar_platforms for multi-platform pillars, AI pipeline generating ONE post PER PLATFORM per pillar, universal Content Pillars with toggle chips in Deep Brief**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-03T03:45:10Z
- **Completed:** 2026-03-03T03:55:20Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments
- Created pillar_platforms junction table with cascade delete, migrating existing single-platform data
- Updated AI pipeline: brief assembler returns platforms[], plan prompt instructs per-platform-per-pillar generation, plan generator dynamically calculates post counts
- Reworked Deep Brief UI: Content Pillars section universal for all product types, multi-platform toggle chips per pillar, product/service types see both pillars and product details

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema migration -- junction table + data migration + drop column** - `c8c48e2` (feat)
2. **Task 2: Brief assembler + AI prompts + plan generator for multi-platform pillars** - `f88f391` (feat)
3. **Task 3: Deep Brief UI -- universal pillars + multi-platform toggle chips + server action** - `2c8fd39` (feat)

## Files Created/Modified
- `src/lib/server/db/schema.ts` - Added pillarPlatforms table, pillarPlatformsRelations, removed platform column from contentPillars
- `src/lib/server/db/migrations/0005_crazy_champions.sql` - Migration with CREATE TABLE, data migration INSERT, DROP COLUMN
- `src/lib/server/ai/pipeline/brief-assembler.ts` - AssembledBrief type updated to platforms[], relational query with junction
- `src/lib/server/ai/prompts/plan-system.ts` - ONE post PER PLATFORM instruction, product details shown alongside pillars
- `src/lib/server/ai/pipeline/plan-generator.ts` - Dynamic minPosts/maxPosts from pillar-platform combinations
- `src/routes/dashboard/onboarding/deep-brief/+page.svelte` - Universal pillars section, multi-platform toggle chips
- `src/routes/dashboard/onboarding/deep-brief/+page.server.ts` - Junction table insert, no personal_brand gate
- `src/routes/dashboard/generate/+page.server.ts` - Updated pillar query with junction
- `src/routes/dashboard/generate/+page.svelte` - Updated platform badges to use pillarPlatforms
- `src/routes/dashboard/settings/[id]/+page.server.ts` - Updated pillar query and updatePlatforms action for junction
- `src/routes/dashboard/settings/[id]/+page.svelte` - Updated platform display to use junction
- `messages/en.json` - Added onb_brief_pillar_platforms, onb_brief_pillar_platforms_hint
- `messages/es.json` - Added Spanish translations for new i18n keys

## Decisions Made
- Junction table `pillar_platforms` replaces single `platform` column for true many-to-many relationships
- Data migration preserves existing platform assignments via INSERT...SELECT before DROP COLUMN
- Content Pillars section is now universal for all product types (personal_brand, product, service)
- Product details section (1b) shown alongside pillars for product/service types, not in exclusive else branch
- Multi-platform toggle chips replace single-select dropdown for cleaner multi-selection UX

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed generate page server/UI for removed platform column**
- **Found during:** Task 2 (AI pipeline updates)
- **Issue:** Generate page server queries `columns: { platform: true }` and template uses `pillar.platform` -- column no longer exists
- **Fix:** Updated server to query with `{ with: { pillarPlatforms } }`, updated template to render platform badges from junction
- **Files modified:** src/routes/dashboard/generate/+page.server.ts, src/routes/dashboard/generate/+page.svelte
- **Verification:** Build succeeds
- **Committed in:** f88f391 (Task 2 commit)

**2. [Rule 3 - Blocking] Fixed settings page server/UI for removed platform column**
- **Found during:** Task 2 (AI pipeline updates)
- **Issue:** Settings page server uses `.set({ platform })` on contentPillars and template displays `pillar.platform` -- column removed
- **Fix:** Updated server to use junction table delete/insert pattern, updated template to use `pillar.pillarPlatforms?.[0]?.platform`
- **Files modified:** src/routes/dashboard/settings/[id]/+page.server.ts, src/routes/dashboard/settings/[id]/+page.svelte
- **Verification:** Build succeeds
- **Committed in:** f88f391 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes were necessary to prevent build failures from the removed platform column. All downstream consumers of contentPillars needed updating. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. Database migration (0005_crazy_champions.sql) must be applied via `pnpm drizzle-kit push` or migration runner.

## Next Phase Readiness
- Junction table and multi-platform pillars fully integrated across schema, AI pipeline, and Deep Brief UI
- Ready for 09-02: dedicated pillars management page, generate page updates, settings page pillar management
- Settings page still uses single-select dropdown for platforms (will be updated in 09-02 to multi-select toggle chips)

---
*Phase: 09-pillar-system-rework*
*Completed: 2026-03-03*
