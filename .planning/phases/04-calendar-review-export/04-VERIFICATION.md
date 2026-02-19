---
phase: 04-calendar-review-export
verified: 2026-02-19T17:45:00Z
status: human_needed
score: 19/20 must-haves verified
human_verification:
  - test: "Calendar chip click to review dialog flow (two-step vs one-step)"
    expected: "Clicking a post chip on the calendar grid should open the review dialog — or at minimum, clicking the chip selects the day and clicking the sidebar post opens the dialog within an acceptable UX"
    why_human: "The plan specified chip click directly opens the dialog (openReview). Implementation instead selects the day in sidebar (handlePostClick sets selectedDay). The sidebar post click DOES open the dialog. Functional flow works in two clicks; verify this UX is acceptable vs the one-click spec in REVW-01."
  - test: "Weekly view navigation shows appropriate week"
    expected: "When week view is active, the user sees a single week of the calendar. Toggling works, chips display, and clicking posts in week view also selects day and opens sidebar."
    why_human: "Week view shows the row containing today, not the currently navigated month's first week. If user navigates to a different month and switches to week view, they see the week containing today (current date), not the navigated month. This may be surprising behavior for CALR-02."
  - test: "Image download works for Supabase-hosted images"
    expected: "Clicking Download Image fetches the image blob and triggers a browser download with filename briefagent-{postId}.jpg"
    why_human: "The blob download pattern requires CORS headers on the image URL. Supabase storage URLs may require specific bucket policy settings. Cannot verify programmatically."
---

# Phase 4: Calendar, Review & Export Verification Report

**Phase Goal:** The user can view their content on a calendar, review and approve each post with full editing and regeneration controls, download/export approved content (copy text + images) for manual publishing, and see everything tied together in the dashboard

**Verified:** 2026-02-19T17:45:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | Posts table has 'published' status, rejectionReason, and publishedAt columns | VERIFIED | schema.ts lines 71-78 (postStatusEnum), lines 121-122 (rejectionReason, publishedAt) |
| 2  | PATCH /api/posts/[id] can update status, copyText, hashtags, scheduledAt, rejectionReason with ownership verification | VERIFIED | src/routes/api/posts/[id]/+server.ts — full Zod schema, ownership check via product relation, all fields updated |
| 3  | POST /api/posts/[id]/regenerate can regenerate copy, image, or both for a single post | VERIFIED | src/routes/api/posts/[id]/regenerate/+server.ts — calls generatePostCopy, generatePostImage, getCachedBrandAnalysis from Phase 3 pipeline |
| 4  | Calendar page loads real posts from DB filtered by month range | VERIFIED | src/routes/dashboard/calendar/+page.server.ts — Drizzle findMany with gte/lte on scheduledAt |
| 5  | Calendar supports month navigation (prev/next) via URL search params | VERIFIED | Calendar page navigateMonth() calls goto() with ?month=YYYY-MM; server load reads url.searchParams.get('month') |
| 6  | Posts on calendar are color-coded by real post_status enum values | VERIFIED | calendar-grid.svelte uses postStatusColors from post-status.ts with statusColor() helper |
| 7  | User can click a post to see a full preview with copy text, image, hashtags, and scheduled date | PARTIAL | Two-click path: chip click selects day in sidebar; sidebar post click opens PostReviewDialog. Dialog shows all fields. PLAN specified one-click from chip — implementation is two-click. |
| 8  | User can edit post copy in a textarea with live character count | VERIFIED | post-review-dialog.svelte lines 318-349 — textarea bound to editedCopy, charCount derived, 3000 char warning |
| 9  | User can swap the visual by triggering image regeneration | VERIFIED | Dialog has "Regenerate Image" button (line 298-309) calling regeneratePost('image') |
| 10 | User can edit hashtags with chip add/remove pattern | VERIFIED | editedHashtags state array, addHashtag() on Enter, removeHashtag() on X button (lines 357-384) |
| 11 | User can edit and approve in one action (save edits + set status to scheduled) | VERIFIED | handleApprove() patches with status: 'scheduled' + copyText + hashtags + scheduledAt in one PATCH call |
| 12 | User can copy post text to clipboard with one click | VERIFIED | copyToClipboard() with navigator.clipboard.writeText + execCommand fallback, "Copied!" feedback for 2s |
| 13 | User can download generated images individually | VERIFIED | downloadImage() uses fetch -> blob -> createObjectURL -> <a download> pattern (needs human for CORS check) |
| 14 | Publishing page shows real posts grouped by status instead of mock data | VERIFIED | publishing/+page.server.ts queries DB, groups into draft/pending_review/scheduled/published columns |
| 15 | Dashboard shows upcoming posts for the next 7 days from real database data | VERIFIED | dashboard/+page.server.ts filters by gte(startOfDay(now), lte(addDays(now, 7))), limit 10 |
| 16 | Dashboard shows quick stats: total posts generated, approved count, pending review count | VERIFIED | Aggregate count() groupBy status query, stats.generated/approved/pendingReview/published displayed as 4 stat cards |
| 17 | Dashboard has a prominent button to generate a new content plan that links to /dashboard/generate | VERIFIED | dashboard/+page.svelte line 136: href="/dashboard/generate" CTA button |
| 18 | No mock data imports in Phase 4 route files | VERIFIED | Zero mock-calendar/mock-publishing/mock-overview imports in dashboard/calendar, dashboard/publishing, dashboard/+page.svelte |
| 19 | User can reject a post with a reason | VERIFIED | showRejectForm state, rejectionReason textarea, handleReject disabled when reason empty, PATCH with rejectionReason |
| 20 | User can mark a post as published manually | VERIFIED | handleMarkPublished() shows only when post.status === 'scheduled', PATCHes status: 'published' |

**Score: 19/20 truths verified (1 partial, flagged for human verification)**

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/server/db/schema.ts` | Extended postStatusEnum with 'published', rejectionReason and publishedAt columns | VERIFIED | Lines 71-78: 6-value enum; Lines 121-122: columns present |
| `src/routes/api/posts/[id]/+server.ts` | PATCH endpoint for post field updates with Zod validation | VERIFIED | Exports PATCH, Zod updateSchema with refine, ownership check, all fields updated |
| `src/routes/api/posts/[id]/regenerate/+server.ts` | POST endpoint for single-post copy/image/both regeneration | VERIFIED | Exports POST, reuses generatePostCopy + generatePostImage + getCachedBrandAnalysis |
| `src/lib/utils/post-status.ts` | Shared status color map and type definitions | VERIFIED | Exports PostStatus type + postStatusColors record with all 6 statuses |
| `src/routes/dashboard/calendar/+page.server.ts` | Server load for calendar posts by month range | VERIFIED | Exports load, Drizzle findMany with month range, URL param navigation |
| `src/lib/components/dashboard/calendar-grid.svelte` | Calendar grid accepting real post data with status colors | VERIFIED | CalendarPost interface, year/month props, $derived.by() grid, status dot chips |
| `src/lib/components/dashboard/post-review-dialog.svelte` | Full post review dialog with editing, approval, regeneration, and export | VERIFIED | 544 lines, Bits UI Dialog, all required sections: image/copy/hashtags/date/actions |
| `src/routes/dashboard/publishing/+page.server.ts` | Server load for posts grouped by status | VERIFIED | Exports load (inline typed), Drizzle findMany, 4-column grouping with rejected->draft merge |
| `src/routes/dashboard/+page.server.ts` | Server load for dashboard stats and upcoming posts | VERIFIED | Exports typed PageServerLoad, count() groupBy, upcoming 7-day query |
| `src/routes/dashboard/+page.svelte` | Dashboard overview wired to real data with generate plan CTA | VERIFIED | data.stats stat cards, data.upcoming section, href="/dashboard/generate" CTA |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `calendar/+page.server.ts` | `schema.ts` | Drizzle query on posts table filtered by scheduledAt range | VERIFIED | `db.query.posts.findMany` with gte/lte on scheduledAt |
| `api/posts/[id]/+server.ts` | `schema.ts` | Drizzle update on posts table with ownership check | VERIFIED | `db.update(posts)` after ownership verification via product relation |
| `api/posts/[id]/regenerate/+server.ts` | `copy-generator.ts` | Reuses generatePostCopy for single-post regeneration | VERIFIED | `generatePostCopy({ topic, contentCategory, keyMessage }, brief)` called at line 51 |
| `post-review-dialog.svelte` | `/api/posts/[id]` | fetch PATCH for status/content updates | VERIFIED | `fetch('/api/posts/${post.id}', { method: 'PATCH' })` in updatePost() |
| `post-review-dialog.svelte` | `/api/posts/[id]/regenerate` | fetch POST for copy/image regeneration | VERIFIED | `fetch('/api/posts/${post.id}/regenerate', { method: 'POST' })` in regeneratePost() |
| `publishing/+page.server.ts` | `schema.ts` | Drizzle query for posts by product | VERIFIED | `db.query.posts.findMany({ where: eq(posts.productId, product.id) })` |
| `dashboard/+page.server.ts` | `schema.ts` | Drizzle aggregate count + upcoming posts query | VERIFIED | `db.select({ status, count: count() }).groupBy(posts.status)` + `db.query.posts.findMany` |
| `dashboard/+page.svelte` | `/dashboard/generate` | CTA button linking to generate page | VERIFIED | `href="/dashboard/generate"` at line 136 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CALR-01 | 04-01 | User can view content calendar in monthly view | SATISFIED | calendar-grid.svelte month view, viewMode='month' default |
| CALR-02 | 04-01 | User can view content calendar in weekly view | SATISFIED | viewMode='week' toggle, visibleCells shows today's calendar row (7 cells) |
| CALR-03 | 04-01 | Posts displayed as thumbnails color-coded by status | SATISFIED | statusColor() in calendar-grid.svelte uses postStatusColors; chips show color dot + topic |
| REVW-01 | 04-02 | User can click any post to see full preview | SATISFIED (with note) | Full preview visible via two-click path: chip -> sidebar -> dialog. See human verification #1. |
| REVW-02 | 04-02 | User can edit post copy with character count display | SATISFIED | post-review-dialog.svelte textarea + charCount derived + 3000 char warning |
| REVW-03 | 04-02 | User can swap the visual asset | SATISFIED | "Regenerate Image" button in dialog image section, calls regeneratePost('image') |
| REVW-04 | 04-02 | User can edit hashtags | SATISFIED | Chip array with X remove + Enter-to-add input in dialog |
| REVW-05 | 04-01 | User can change the scheduled time | SATISFIED | datetime-local input bound to editedScheduledAt, included in approve PATCH |
| REVW-06 | 04-01 | User can approve a post (status becomes scheduled) | SATISFIED | handleApprove() patches { status: 'scheduled', ... } |
| REVW-07 | 04-01 | User can reject a post with a reason | SATISFIED | showRejectForm + rejectionReason textarea, disabled when empty, PATCH { status: 'rejected', rejectionReason } |
| REVW-08 | 04-01 | User can regenerate copy only via separate button | SATISFIED | "Regenerate Copy" button in action bar, calls regeneratePost('copy') |
| REVW-09 | 04-01 | User can regenerate image only via separate button | SATISFIED | "Regenerate Image" button in image section, calls regeneratePost('image') |
| REVW-10 | 04-01 | User can regenerate both copy and image | SATISFIED | "Regenerate Both" button in action bar, calls regeneratePost('both') |
| REVW-11 | 04-02 | User can edit and approve in one action | SATISFIED | handleApprove() saves copyText + hashtags + scheduledAt + sets status='scheduled' in one PATCH |
| EXPT-01 | 04-02 | User can copy approved post text to clipboard with one click | SATISFIED | copyToClipboard() with clipboard API + execCommand fallback + "Copied!" feedback |
| EXPT-02 | 04-02 | User can download generated images individually | SATISFIED | downloadImage() blob pattern — needs human CORS check (see human verification #3) |
| EXPT-03 | 04-02 | User can mark a post as "published" manually | SATISFIED | handleMarkPublished() visible only when status='scheduled', PATCHes { status: 'published' } |
| DASH-01 | 04-03 | Dashboard shows upcoming posts for the next 7 days | SATISFIED | +page.server.ts upcoming query gte(startOfDay, lte(+7 days)), rendered in +page.svelte |
| DASH-02 | 04-03 | Dashboard shows quick stats (posts generated, approved, pending review) | SATISFIED | 4 stat cards: generated/pendingReview/approved/published from aggregate count query |
| DASH-03 | 04-03 | Dashboard has button to generate a new content plan | SATISFIED | CTA card with href="/dashboard/generate" button rendered when hasProduct=true |

**All 20 requirement IDs accounted for. No orphaned requirements.**

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/components/dashboard/content-chip.svelte` | 2 | `import type { ContentType, ContentStatus } from '$lib/data/mock-calendar'` | Info | Component not used in any Phase 4 routes; legacy from Phase 5 Dashboard UI. Mock file still on disk but not causing build failures. |
| `src/lib/components/dashboard/schedule-card.svelte` | 2 | `import type { ScheduleItem } from '$lib/data/mock-overview.js'` | Info | Not used in dashboard/+page.svelte (replaced with inline rendering). Legacy component. |
| `src/lib/components/dashboard/activity-feed.svelte` | 2 | `import type { ActivityItem } from '$lib/data/mock-overview.js'` | Info | Not imported in any Phase 4 route. Legacy component. |
| `src/lib/components/dashboard/ai-panel.svelte` | 4 | `import type { AiSuggestion, PublishingStat } from '$lib/data/mock-publishing.js'` | Info | Used in publishing +page.svelte sidebar? No — publishing page uses its own stats sidebar. Legacy. |

Note: All four legacy components import types from mock files that still exist on disk. However, none are imported by any Phase 4 route files (calendar, publishing, dashboard). The mock data files remain on disk but are not referenced by the three key routes. No blocker anti-patterns found.

---

## Human Verification Required

### 1. Calendar chip click to review dialog (UX gap vs plan spec)

**Test:** Open the calendar page with some posts. Click a post chip directly on the calendar grid.
**Expected per REVW-01:** Full post preview should open (either directly, or via a reasonable 2-step flow).
**Actual behavior:** Chip click selects the day and shows posts in the right sidebar. User must then click the sidebar post row to open the review dialog.
**Why human:** The plan specified chip click directly sets selectedPost and opens dialog. Implementation is a two-step flow (chip -> sidebar -> dialog). The functional requirement is met (user can review posts), but the UX is different from the plan. Verify whether this two-click flow is acceptable or whether the chip should open the dialog directly.

### 2. Weekly view behavior when navigating between months

**Test:** Navigate to next month using the month navigation arrows. Switch to week view.
**Expected:** Ideally shows a week from the navigated month.
**Actual behavior:** Week view shows the row containing today's date (current date, not navigated month). If viewing February from March, week view may show a March week.
**Why human:** This is a UX concern for CALR-02. The weekly view is functional but may confuse users navigating to a different month then switching to week view.

### 3. Image download CORS verification

**Test:** Open a post with a generated image in the review dialog. Click "Download Image."
**Expected:** Image downloads with filename `briefagent-{postId}.jpg`.
**Why human:** The blob fetch pattern requires the image server (Supabase storage) to return CORS headers allowing the client origin. This cannot be verified without a running server with real images.

---

## Gaps Summary

No hard gaps found. The phase goal is functionally achieved:

- Content calendar shows real posts from DB with month navigation and status colors (CALR-01, CALR-02, CALR-03)
- Post review dialog provides all editing controls: copy textarea with char count, chip hashtag editor, datetime picker, approve-with-edits, reject-with-reason, regenerate copy/image/both (REVW-01 through REVW-11)
- Export capabilities implemented: clipboard copy with feedback, image blob download (EXPT-01, EXPT-02, EXPT-03)
- Dashboard wired to real DB data: 4 stat cards, upcoming 7-day posts, generate plan CTA (DASH-01, DASH-02, DASH-03)
- Publishing page shows 4 kanban columns with real posts grouped by status

Three items require human confirmation:
1. Two-click calendar flow acceptability (UX decision, not a functional failure)
2. Weekly view behavior across month navigation (UX edge case)
3. Image download CORS correctness (external service verification)

All 6 commits verified present in git history. All 20 requirement IDs satisfied with code evidence.

---

_Verified: 2026-02-19T17:45:00Z_
_Verifier: Claude (gsd-verifier)_
