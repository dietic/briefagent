---
phase: 04-calendar-review-export
plan: 02
subsystem: ui, api
tags: [bits-ui, dialog, svelte5, kanban, review-workflow, clipboard-api, blob-download]

requires:
  - phase: 04-calendar-review-export
    plan: 01
    provides: "PATCH /api/posts/[id] and POST /api/posts/[id]/regenerate endpoints, calendar data layer, post-status utility"
  - phase: 05-dashboard-ui
    provides: "KanbanColumn, PostCard, AiPanel dashboard components with mock data"
provides:
  - "PostReviewDialog component with full editing, approval, regeneration, and export capabilities"
  - "Publishing page server load querying real posts grouped by status"
  - "PostCard and KanbanColumn updated for real post data (no more mock imports)"
  - "Calendar and publishing pages wired to review dialog via click interactions"
affects: [04-03]

tech-stack:
  added: []
  patterns:
    - "Bits UI Dialog compound component (Root > Portal > Overlay + Content) for modal dialogs"
    - "Blob download pattern: fetch -> blob -> createObjectURL -> <a download> -> revokeObjectURL"
    - "Clipboard API with execCommand fallback for copy-to-clipboard"
    - "Status-grouped server queries with rejected posts merged into draft column"

key-files:
  created:
    - src/lib/components/dashboard/post-review-dialog.svelte
    - src/routes/dashboard/publishing/+page.server.ts
  modified:
    - src/routes/dashboard/calendar/+page.svelte
    - src/routes/dashboard/calendar/+page.server.ts
    - src/routes/dashboard/publishing/+page.svelte
    - src/lib/components/dashboard/post-card.svelte
    - src/lib/components/dashboard/kanban-column.svelte
    - src/lib/components/dashboard/calendar-grid.svelte
    - messages/en.json
    - messages/es.json

key-decisions:
  - "Bits UI Dialog with Portal for z-index layering and escape/click-outside dismissal"
  - "Rejected posts grouped into Draft kanban column for rework visibility"
  - "Inline typed parent() instead of $types import for publishing server load -- avoids build order dependency"
  - "PostCard rewritten as button element for accessibility (entire card clickable)"

patterns-established:
  - "Review dialog pattern: $bindable open + onupdate callback for parent invalidation"
  - "Blob download for generated images: fetch -> blob -> object URL -> anchor click"
  - "Chip hashtag editing: $state array + Enter keydown + X remove (consistent with onboarding)"

requirements-completed: [REVW-01, REVW-02, REVW-03, REVW-04, REVW-11, EXPT-01, EXPT-02, EXPT-03]

duration: 7min
completed: 2026-02-19
---

# Phase 4 Plan 02: Post Review Dialog + Publishing Wiring Summary

**Bits UI review dialog with inline copy/hashtag/date editing, approve-with-edits, reject-with-reason, regenerate, clipboard copy, and image download -- wired into calendar and publishing pages with real DB data**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-19T17:05:31Z
- **Completed:** 2026-02-19T17:12:47Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Built PostReviewDialog component with full editing capabilities: textarea with live character count, chip-style hashtag editor, datetime-local scheduler, approve (saves edits + schedules), reject (with reason), regenerate (copy/image/both), copy-to-clipboard with feedback, and image blob download
- Created publishing server load querying all posts grouped by status into 4 kanban columns (Draft, Pending Review, Scheduled, Published) with rejected posts merged into Draft
- Wired review dialog into both calendar page (click sidebar post) and publishing page (click PostCard) with invalidateAll() refresh on actions
- Replaced all mock-publishing.ts imports with real DB data throughout the publishing pipeline

## Task Commits

Each task was committed atomically:

1. **Task 1: Build post review dialog with editing, approval, regeneration, and export** - `8820ae3` (feat)
2. **Task 2: Wire review dialog into calendar and publishing pages with real data** - `a2d6db5` (feat)

## Files Created/Modified
- `src/lib/components/dashboard/post-review-dialog.svelte` - Full review dialog with Bits UI Dialog, editing, approval, regeneration, export
- `src/routes/dashboard/publishing/+page.server.ts` - Server load querying posts grouped by status
- `src/routes/dashboard/publishing/+page.svelte` - Rewritten with real data, review dialog, stats sidebar
- `src/routes/dashboard/calendar/+page.svelte` - Added review dialog on sidebar post click
- `src/routes/dashboard/calendar/+page.server.ts` - Added keyMessage to query columns for dialog
- `src/lib/components/dashboard/post-card.svelte` - Rewritten for real post data with status dots
- `src/lib/components/dashboard/kanban-column.svelte` - Updated for real status IDs, removed mock type import
- `src/lib/components/dashboard/calendar-grid.svelte` - Extended interface with optional copyText, hashtags, keyMessage
- `messages/en.json` - Added 22 i18n keys (review_* + pub_*)
- `messages/es.json` - Added 22 i18n keys (Spanish translations)

## Decisions Made
- Used Bits UI Dialog with Portal for proper z-index layering and built-in escape/click-outside dismissal
- Rejected posts are grouped into the Draft kanban column (not a separate column) to keep the 4-column layout clean
- Used inline typed parent() parameter in publishing server load instead of $types import to avoid build order dependency (consistent with 04-01 API pattern)
- Rewrote PostCard as a `<button>` element for better accessibility when the entire card is clickable

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added keyMessage to calendar server query**
- **Found during:** Task 2 (wiring review dialog into calendar)
- **Issue:** Calendar server load didn't include keyMessage column, which the review dialog requires
- **Fix:** Added `keyMessage: true` to calendar +page.server.ts query columns
- **Files modified:** src/routes/dashboard/calendar/+page.server.ts
- **Verification:** svelte-check passes, dialog receives keyMessage prop
- **Committed in:** a2d6db5 (Task 2 commit)

**2. [Rule 3 - Blocking] Extended CalendarGrid interface for new fields**
- **Found during:** Task 2 (type checking)
- **Issue:** CalendarGrid's CalendarPost interface didn't include copyText, hashtags, keyMessage fields needed by the dialog
- **Fix:** Added optional copyText, hashtags, keyMessage fields to CalendarPost interface
- **Files modified:** src/lib/components/dashboard/calendar-grid.svelte
- **Verification:** svelte-check passes with 0 errors
- **Committed in:** a2d6db5 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary to pass type checking with the new dialog integration. No scope creep.

## Issues Encountered
- Paraglide v2 requires Vite build plugin to compile new message keys -- ran `pnpm build` to trigger compilation before svelte-check could recognize new i18n keys

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Review and approval workflow complete, ready for 04-03 (export/download features)
- All post statuses cycle correctly: draft -> pending_review -> scheduled -> published (and rejected -> draft)
- Publishing page fully data-driven, ready for any future filtering or sorting enhancements

## Self-Check: PASSED

- All 8 key files verified present on disk
- Both task commits (8820ae3, a2d6db5) verified in git log
- `npx svelte-check` passes with 0 errors
- `pnpm build` succeeds

---
*Phase: 04-calendar-review-export*
*Completed: 2026-02-19*
