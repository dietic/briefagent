---
phase: 06-onboarding-enhancement
plan: 02
subsystem: onboarding
tags: [svelte5, drizzle, i18n, social-accounts, crud-api, brand-page]

# Dependency graph
requires:
  - phase: 06-onboarding-enhancement
    provides: socialAccounts table schema, products table with ownership, i18n keys for social accounts
  - phase: 02-auth-onboarding
    provides: Supabase auth, getUser(), dashboard layout with product context
provides:
  - POST /api/social-accounts endpoint with auth + ownership verification
  - DELETE /api/social-accounts/[id] endpoint with ownership check
  - Social accounts management UI on brand page (add/remove/list)
  - Social account count display on settings page product cards
  - Brand page server load includes socialAccounts for active product
  - Settings page server load includes socialAccountCounts per product
affects: [ai-generation-pipeline, content-publishing]

# Tech tracking
tech-stack:
  added: []
  patterns: [relational ownership check via db.query with { with: product } for nested auth, inline add form with $state toggle]

key-files:
  created:
    - src/routes/api/social-accounts/+server.ts
    - src/routes/api/social-accounts/[id]/+server.ts
  modified:
    - src/routes/dashboard/brand/+page.server.ts
    - src/routes/dashboard/brand/+page.svelte
    - src/routes/dashboard/settings/+page.server.ts
    - src/routes/dashboard/settings/+page.svelte

key-decisions:
  - "RequestHandler from $types (not RequestEvent) for API endpoint typing -- consistent with all existing API endpoints"
  - "Relational query with { with: product } for ownership check on DELETE -- avoids extra join"
  - "Platform labels as static Record (not i18n) since they are proper nouns"
  - "Platform color map with hex + alpha suffix for badge backgrounds"

patterns-established:
  - "Social account ownership check: load account with product relation, verify product.userId"
  - "Inline CRUD form: $state toggle for add form visibility, invalidateAll() after mutations"

requirements-completed: [ONB2-02]

# Metrics
duration: 5min
completed: 2026-02-20
---

# Phase 06 Plan 02: Social Accounts Management Summary

**CRUD API for social accounts with ownership verification, management UI on brand page (add/remove with platform badges), and account counts on settings page**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-20T00:32:31Z
- **Completed:** 2026-02-20T00:38:15Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Full CRUD API for social accounts with auth and product ownership verification
- Social Accounts card on brand page with platform-colored badges, handle/URL display, and inline add/remove
- Social account count indicator on settings page product cards
- All UI text uses Paraglide i18n (en/es, 10 existing keys reused)

## Task Commits

Each task was committed atomically:

1. **Task 1: Social accounts API endpoints + server load integration** - `2b31e60` (feat)
2. **Task 2: Social accounts management UI in brand + settings pages** - `c99ba61` (feat)

## Files Created/Modified
- `src/routes/api/social-accounts/+server.ts` - POST endpoint to create social account with auth + ownership
- `src/routes/api/social-accounts/[id]/+server.ts` - DELETE endpoint to remove social account with ownership check
- `src/routes/dashboard/brand/+page.server.ts` - Added socialAccounts query for active product, fixed pre-existing double .where() bug
- `src/routes/dashboard/brand/+page.svelte` - Social Accounts card with list, inline add form, remove buttons, platform badges
- `src/routes/dashboard/settings/+page.server.ts` - Added socialAccountCounts per product
- `src/routes/dashboard/settings/+page.svelte` - Social account count indicator in product info row

## Decisions Made
- Used `RequestHandler` from `$types` instead of plan's suggested `RequestEvent` from `@sveltejs/kit` to stay consistent with all existing API endpoints in the codebase
- Platform labels (LinkedIn, Instagram, etc.) stored as static Record, not i18n, since they are proper nouns
- TikTok badge color changed from #000000 (invisible on dark theme) to #69C9D0 (TikTok teal)
- Used `invalidateAll()` for data refresh after add/remove operations

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed pre-existing double .where() in brand page server**
- **Found during:** Task 1 (brand page server load modification)
- **Issue:** `db.select().from(posts).where(X).where(Y)` chaining causes TypeScript error -- Drizzle ORM requires `and()` for multiple conditions
- **Fix:** Changed to `.where(and(eq(posts.contentPlanId, planId), eq(posts.status, 'published')))`
- **Files modified:** `src/routes/dashboard/brand/+page.server.ts`
- **Verification:** `npx svelte-check` passes with 0 errors
- **Committed in:** `2b31e60` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Pre-existing bug fix necessary for clean type checking. No scope creep.

## Issues Encountered
None

## User Setup Required
Run `pnpm drizzle-kit push` to apply the socialAccounts table if not already done after plan 06-01.

## Next Phase Readiness
- Social accounts CRUD fully operational -- ready for platform-specific content targeting in AI pipeline
- Phase 06 complete -- all onboarding enhancements delivered

## Self-Check: PASSED

- All 6 files: FOUND
- Commit 2b31e60: FOUND
- Commit c99ba61: FOUND

---
*Phase: 06-onboarding-enhancement*
*Completed: 2026-02-20*
