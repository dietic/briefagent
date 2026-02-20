---
phase: 07-content-pillars
plan: 01
subsystem: database, ui, onboarding
tags: [drizzle, svelte5, i18n, content-pillars, personal-brand]

requires:
  - phase: 02-auth-onboarding
    provides: "Deep Brief page, products table, productBriefs table, onboarding flow"
  - phase: 06-onboarding-enhancement
    provides: "productType column on products table, personal_brand type selector"
provides:
  - "contentPillars database table with FK to products"
  - "Conditional Deep Brief Section 1: pillar editor for personal_brand, product details for others"
  - "Server-side pillar CRUD via form actions"
  - "16 i18n keys (en/es) for pillar UI"
affects: [07-02-PLAN, ai-generation-pipeline, content-plan-generation]

tech-stack:
  added: []
  patterns:
    - "Conditional section rendering based on productType in onboarding forms"
    - "JSON-stringified hidden input for structured array data submission"
    - "Delete-all-then-insert pattern for pillar replacement on save"

key-files:
  created: []
  modified:
    - src/lib/server/db/schema.ts
    - src/routes/dashboard/onboarding/deep-brief/+page.server.ts
    - src/routes/dashboard/onboarding/deep-brief/+page.svelte
    - messages/en.json
    - messages/es.json

key-decisions:
  - "Delete-all-then-insert pattern for pillar save (simpler than diff-based upsert, acceptable for small arrays)"
  - "Null out product detail fields for personal_brand type (pillars replace product details)"

patterns-established:
  - "Conditional onboarding sections: {#if data.productType === 'personal_brand'} for type-specific UI"
  - "Pillar card editor: card-based CRUD with add/remove, max limit, suggestion pills"

requirements-completed: [PILR-01, PILR-02]

duration: 3min
completed: 2026-02-20
---

# Phase 7 Plan 1: Content Pillars Schema + Deep Brief UI Summary

**contentPillars DB table with conditional Deep Brief Section 1 showing card-based pillar editor for Personal Brand users and unchanged Product Details for other types**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-20T02:12:56Z
- **Completed:** 2026-02-20T02:16:35Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- contentPillars table with id, productId FK (cascade), name, description, sortOrder, createdAt
- Conditional Section 1 in Deep Brief: pillar card editor for personal_brand, original Product Details for product/service
- Server-side pillar load (ordered by sortOrder) and save (delete+insert pattern) via form actions
- 16 new i18n keys in both en.json and es.json for pillar UI

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema + server-side pillar data loading and saving** - `1616ede` (feat)
2. **Task 2: Conditional Deep Brief Section 1 UI with pillar card editor + i18n** - `ba32b62` (feat)

## Files Created/Modified
- `src/lib/server/db/schema.ts` - Added contentPillars table, contentPillarsRelations, updated productsRelations
- `src/routes/dashboard/onboarding/deep-brief/+page.server.ts` - Load pillars, save/delete pillars for personal_brand, null product details for personal_brand
- `src/routes/dashboard/onboarding/deep-brief/+page.svelte` - Conditional Section 1 with card-based pillar editor (add/remove, 1-5 limit, suggestion pills)
- `messages/en.json` - 16 new pillar i18n keys (en)
- `messages/es.json` - 16 new pillar i18n keys (es)

## Decisions Made
- Delete-all-then-insert pattern for pillar save: simpler than diff-based upsert, acceptable for arrays of 1-5 items
- Null out product detail fields (problemSolved, keyFeatures, differentiator, pricingInfo, productStage) for personal_brand type since pillars replace them

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Run `pnpm drizzle-kit push` to apply the new contentPillars table to the database.

## Next Phase Readiness
- contentPillars table and CRUD ready for 07-02 (pillar-aware content generation)
- Pillar data available via drizzle relational queries for AI pipeline integration

## Self-Check: PASSED

All 5 modified files verified present. Both task commits (1616ede, ba32b62) verified in git log.

---
*Phase: 07-content-pillars*
*Completed: 2026-02-20*
