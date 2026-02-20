---
phase: 08-platform-selection-per-pillar
plan: 02
subsystem: ai, api
tags: [openai, ai-sdk, platform-specs, copy-generation, image-generation, prompts]

# Dependency graph
requires:
  - phase: 08-platform-selection-per-pillar
    plan: 01
    provides: PLATFORM_SPECS config, getPlatformSpec helper, platform column on content_pillars
  - phase: 03-ai-generation-pipeline
    provides: AI pipeline (brief assembler, plan/copy/image generators, prompts)
provides:
  - Platform-aware brief assembler (platform field in contentPillars)
  - Multi-platform plan schema (linkedin | x)
  - Platform-specific plan prompts with per-pillar platform assignment
  - Platform-dynamic copy prompts (char limits, tone, hashtag rules)
  - Platform-specific image resize dimensions
  - Full pipeline platform passthrough (post-generator -> copy/image generators)
affects: [content-generation, ai-pipeline]

# Tech tracking
tech-stack:
  added: []
  patterns: [getPlatformSpec for dynamic prompt injection, null-defaults-to-linkedin pattern, platform passthrough from plan to generators]

key-files:
  modified:
    - src/lib/server/ai/pipeline/brief-assembler.ts
    - src/lib/server/ai/schemas/plan.ts
    - src/lib/server/ai/prompts/plan-system.ts
    - src/lib/server/ai/prompts/copy-system.ts
    - src/lib/server/ai/pipeline/copy-generator.ts
    - src/lib/server/ai/prompts/image-system.ts
    - src/lib/server/ai/pipeline/image-generator.ts
    - src/lib/server/ai/pipeline/post-generator.ts

key-decisions:
  - "getPlatformSpec(platform) as the single integration point for all platform-specific behavior in prompts and generators"
  - "Default parameters (platform = null) on all generator functions for backward compatibility"
  - "Platform-specific extras block in copy prompt (linkedin: line breaks/emoji rules, x: conciseness/thread guidance)"

patterns-established:
  - "Platform passthrough: post.platform flows from plan schema through post-generator to copy-generator and image-generator"
  - "Null-defaults-to-LinkedIn: every getPlatformSpec(null) returns LinkedIn spec for backward compatibility"

requirements-completed: [SC-04, SC-05]

# Metrics
duration: 3min
completed: 2026-02-20
---

# Phase 8 Plan 02: Platform-Aware Content Generation Pipeline Summary

**Full AI pipeline platform-aware: copy uses platform char limits/tone, images resize to platform dimensions, plan prompts assign platforms per pillar**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-20T21:48:44Z
- **Completed:** 2026-02-20T21:51:58Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Brief assembler now includes pillar platform data in AssembledBrief for downstream use
- Plan schema accepts both 'linkedin' and 'x' platforms, with prompts instructing per-pillar assignment
- Copy generation dynamically injects platform-specific char limits, tone, and hashtag rules
- Image generation resizes to platform-specific dimensions (1200x1200 for LinkedIn, 1200x675 for X)
- Post generator passes post.platform through to both copy and image generators
- Null/missing platform defaults to LinkedIn everywhere (backward compatible)

## Task Commits

Each task was committed atomically:

1. **Task 1: Brief assembler + plan schema + plan prompts** - `eb71fba` (feat)
2. **Task 2: Copy prompts + image prompts + generators** - `96b1019` (feat)

## Files Created/Modified
- `src/lib/server/ai/pipeline/brief-assembler.ts` - Added platform field to AssembledBrief contentPillars interface and mapping
- `src/lib/server/ai/schemas/plan.ts` - Changed platform from literal 'linkedin' to enum ['linkedin', 'x']
- `src/lib/server/ai/prompts/plan-system.ts` - Multi-platform strategist prompt with per-pillar platform labels and rules
- `src/lib/server/ai/prompts/copy-system.ts` - Dynamic platform-specific copy rules (char limits, tone, hashtags, extras)
- `src/lib/server/ai/pipeline/copy-generator.ts` - Added platform parameter passthrough to prompt builders
- `src/lib/server/ai/prompts/image-system.ts` - Platform-aware image prompt with display name and aspect ratio
- `src/lib/server/ai/pipeline/image-generator.ts` - Platform-specific resize dimensions via getPlatformSpec
- `src/lib/server/ai/pipeline/post-generator.ts` - Passes post.platform to both copy and image generators

## Decisions Made
- Used `getPlatformSpec(platform)` as the single integration point for all platform-specific behavior, avoiding scattered platform conditionals
- Added default parameters (`platform = null`) on all modified generator functions to maintain backward compatibility with existing callers
- Platform-specific extras in copy prompt: LinkedIn gets line break/emoji rules, X gets conciseness/thread guidance

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Entire AI pipeline is platform-aware, from brief assembly through content plan generation to copy and image output
- Adding new platforms requires only: adding to PLATFORM_SPECS (active: true) and extending the Zod enum in plan.ts
- Phase 8 complete: platform selection per pillar fully integrated end-to-end

---
*Phase: 08-platform-selection-per-pillar*
*Completed: 2026-02-20*
