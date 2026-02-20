---
phase: 08-platform-selection-per-pillar
plan: 01
subsystem: database, ui, ai
tags: [drizzle, svelte5, platform-specs, content-pillars, i18n]

# Dependency graph
requires:
  - phase: 07-content-pillars
    provides: content_pillars table and Deep Brief UI
provides:
  - platform column on content_pillars table
  - PLATFORM_SPECS config with all 5 platform specs
  - ACTIVE_PLATFORMS / COMING_SOON_PLATFORMS exports
  - getPlatformSpec helper function
  - Platform dropdown per pillar card in Deep Brief UI
affects: [08-02-platform-aware-generation, ai-pipeline, content-generation]

# Tech tracking
tech-stack:
  added: []
  patterns: [platform-specs single source of truth, active/coming-soon platform separation, server-side platform validation]

key-files:
  created:
    - src/lib/server/ai/platform-specs.ts
    - src/lib/server/db/migrations/0003_bumpy_joystick.sql
  modified:
    - src/lib/server/db/schema.ts
    - src/routes/dashboard/onboarding/deep-brief/+page.svelte
    - src/routes/dashboard/onboarding/deep-brief/+page.server.ts
    - messages/en.json
    - messages/es.json

key-decisions:
  - "Inline platformOptions in Svelte component (not server import) since platform-specs.ts is server-only"
  - "Server-side activeSlugs Set validation prevents coming-soon platforms from being saved via devtools"
  - "Empty string for unselected platform in UI, persisted as null in DB"

patterns-established:
  - "PLATFORM_SPECS as single source of truth for all platform-specific config across the pipeline"
  - "Active/coming-soon platform separation pattern for gradual platform rollout"

requirements-completed: [SC-01, SC-02, SC-03]

# Metrics
duration: 4min
completed: 2026-02-20
---

# Phase 8 Plan 01: Platform Selection per Pillar Summary

**Platform column on content_pillars, PLATFORM_SPECS config with 5 platforms, and per-pillar platform dropdown in Deep Brief UI**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-20T21:38:38Z
- **Completed:** 2026-02-20T21:42:12Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Added nullable `platform` text column to `content_pillars` table with migration
- Created `platform-specs.ts` as the single source of truth for all 5 platforms (LinkedIn, X, Instagram, YouTube, TikTok)
- Added platform dropdown to each pillar card in Deep Brief with LinkedIn/X active and 3 coming-soon disabled options
- Server-side validation rejects coming-soon platform slugs

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema migration + platform-specs config** - `3a7f86d` (feat)
2. **Task 2: Deep Brief UI platform dropdown + server persistence + i18n** - `5447dfa` (feat)

## Files Created/Modified
- `src/lib/server/ai/platform-specs.ts` - Platform specifications config (PLATFORM_SPECS, ACTIVE_PLATFORMS, COMING_SOON_PLATFORMS, getPlatformSpec)
- `src/lib/server/db/schema.ts` - Added platform column to contentPillars table
- `src/lib/server/db/migrations/0003_bumpy_joystick.sql` - ALTER TABLE for platform column
- `src/routes/dashboard/onboarding/deep-brief/+page.svelte` - Platform dropdown per pillar card with i18n
- `src/routes/dashboard/onboarding/deep-brief/+page.server.ts` - Platform persistence with active-only validation
- `messages/en.json` - 3 new i18n keys (onb_brief_pillar_platform*)
- `messages/es.json` - 3 new i18n keys (onb_brief_pillar_platform*)

## Decisions Made
- Inline platformOptions constant in Svelte component rather than importing from server-only platform-specs.ts
- Server-side Set-based validation of active platform slugs to prevent coming-soon platforms from being saved
- Empty string in UI maps to null in DB for unselected platforms

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `drizzle-kit push` fails with TypeError on this drizzle-kit version (known bug). Used custom `migrate.ts` script as fallback, which worked correctly.

## User Setup Required

None - migration applied automatically via migrate.ts script.

## Next Phase Readiness
- Platform column populated per pillar, ready for Plan 08-02 (platform-aware content generation)
- PLATFORM_SPECS config available for prompt assembly and content formatting
- getPlatformSpec helper ready for AI pipeline integration

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 08-platform-selection-per-pillar*
*Completed: 2026-02-20*
