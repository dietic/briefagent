# Phase 4: Calendar, Review & Export - Research

**Researched:** 2026-02-19
**Domain:** Calendar UI data wiring, post review/approval workflow, export/download, dashboard stats
**Confidence:** HIGH

## Summary

Phase 4 transforms the existing mock-data dashboard (built in Phase 5) into a fully functional content management interface backed by real database records from Phase 3's AI generation pipeline. The existing `posts` table already stores AI-generated content with `copyText`, `hashtags`, `imageUrl`, `scheduledAt`, and `status` fields. The existing dashboard pages (`/dashboard/calendar`, `/dashboard/editor`, `/dashboard/publishing`, `/dashboard`) already have the UI structure and component hierarchy -- they just consume mock data from `src/lib/data/mock-*.ts` files.

The core work is: (1) replace mock data imports with SvelteKit `+page.server.ts` loads that query real posts from the database, (2) add API endpoints for post status transitions (approve, reject, mark-as-published), copy/hashtag editing, scheduled date changes, and regeneration, (3) add missing database columns (`rejectionReason`, `publishedAt`) and enum values (`published`) to support the full workflow, (4) wire the existing calendar grid component to real post data with proper status color coding, and (5) add clipboard copy and image download functionality for the export flow.

No new libraries are needed. The project already has everything required: Drizzle ORM for database access, the AI SDK pipeline for regeneration (reuse `generatePostCopy` and `generatePostImage`), Bits UI for accessible dialogs, `date-fns` for date manipulation, Supabase Storage for image downloads, and Lucide Svelte for icons.

**Primary recommendation:** Wire existing dashboard UI to real data via `+page.server.ts` loads and SvelteKit form actions. Reuse Phase 3's `generatePostCopy` and `generatePostImage` functions for single-post regeneration endpoints. Use `navigator.clipboard.writeText()` for copy-to-clipboard and `<a download>` with Supabase public URLs for image downloads.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CALR-01 | User can view content calendar in monthly view | Existing `calendar-grid.svelte` already has month view with `$derived.by()` grid cells; replace `CalendarEvent[]` mock data with real `posts` query by `scheduledAt` date range |
| CALR-02 | User can view content calendar in weekly view | Existing `calendar-grid.svelte` already has week view toggle via `viewMode` prop; same data source switch applies |
| CALR-03 | Posts displayed as thumbnails color-coded by status | Existing `content-chip.svelte` has status dots; update color map from mock `ContentStatus` to real `post_status` enum values (draft=gray, pending_review=yellow, approved=blue, scheduled=green, published=dark-green, rejected=red) |
| REVW-01 | User can click any post to see full preview | Use Bits UI `Dialog.Root` to open a modal with the post's `copyText`, `imageUrl`, `hashtags`, `scheduledAt`; existing `editor/+page.svelte` has the LinkedIn preview card layout to reuse |
| REVW-02 | User can edit post copy with character count display | Textarea bound to `copyText` with `$derived` character counter; save via form action or PATCH endpoint |
| REVW-03 | User can swap the visual asset | Trigger `generatePostImage` for this single post (reuse Phase 3 image-generator); shows current image with "Regenerate Image" button |
| REVW-04 | User can edit hashtags | Tag input component (chip pattern from onboarding: `$state` array + Enter keydown + X remove); save to `posts.hashtags` array column |
| REVW-05 | User can change the scheduled time | Date/time picker bound to `posts.scheduledAt`; `date-fns` for formatting |
| REVW-06 | User can approve a post (status becomes scheduled) | PATCH `/api/posts/[id]` with `{status: 'approved'}` which transitions to 'approved' in DB (or 'scheduled' per requirement -- use 'approved' since no auto-publishing exists) |
| REVW-07 | User can reject a post with a reason | PATCH `/api/posts/[id]` with `{status: 'rejected', rejectionReason: string}`; new `rejectionReason` text column needed |
| REVW-08 | User can regenerate copy only | POST `/api/posts/[id]/regenerate` with `{type: 'copy'}`; reuses `generatePostCopy` from Phase 3 |
| REVW-09 | User can regenerate image only | POST `/api/posts/[id]/regenerate` with `{type: 'image'}`; reuses `generatePostImage` from Phase 3 |
| REVW-10 | User can regenerate both copy and image | POST `/api/posts/[id]/regenerate` with `{type: 'both'}`; runs copy then image sequentially |
| REVW-11 | User can edit and approve in one action | Single form action or PATCH that saves edits (copyText, hashtags, scheduledAt) AND sets status to 'approved' atomically |
| EXPT-01 | User can copy approved post text to clipboard | `navigator.clipboard.writeText(post.copyText)` with transient "Copied!" toast; requires HTTPS (Supabase + SvelteKit default) |
| EXPT-02 | User can download generated images individually | `<a href={post.imageUrl} download>` for Supabase public URLs; or fetch + Blob URL for cross-origin |
| EXPT-03 | User can mark a post as "published" manually | PATCH `/api/posts/[id]` with `{status: 'published'}`; add `published` to `postStatusEnum`; optionally set `publishedAt` timestamp |
| DASH-01 | Dashboard shows upcoming posts for the next 7 days | Query `posts` WHERE `scheduledAt >= now AND scheduledAt <= now + 7 days AND status IN ('approved', 'scheduled')`; replace `scheduleItems` mock |
| DASH-02 | Dashboard shows quick stats (posts generated, approved, pending review) | Aggregate counts from `posts` table using `count()` with `WHERE` by status; replace `kpiCards` mock |
| DASH-03 | Dashboard has button to generate a new content plan | Already exists in `/dashboard/generate` page; link from dashboard overview with prominent CTA button |
</phase_requirements>

## Standard Stack

### Core (No new dependencies -- everything already installed)

| Library | Version | Purpose | Phase 4 Use |
|---------|---------|---------|-------------|
| `drizzle-orm` | ^0.45.1 | Database ORM | Query posts for calendar/dashboard, update post status/content, aggregate stats |
| `bits-ui` | ^2.0.0 | Headless UI components | `Dialog` for post review modal, accessible keyboard navigation |
| `date-fns` | ^4.1.0 | Date utilities | Format `scheduledAt` dates, compute 7-day window for dashboard, calendar date ranges |
| `lucide-svelte` | ^0.500.0 | Icons | Copy, Download, Check, X, RefreshCw for action buttons |
| `@supabase/supabase-js` | ^2.95.3 | Storage access | Public URL for image downloads |
| `zod` | ^4.3.6 | Validation | Validate PATCH/POST request bodies for post updates |
| `ai` + `@ai-sdk/openai` | ^6.0.91 / ^3.0.30 | AI SDK | Reuse `generatePostCopy` and `generatePostImage` for single-post regeneration |

### Supporting (already installed, used in specific patterns)

| Library | Version | Purpose | Phase 4 Use |
|---------|---------|---------|-------------|
| `sharp` | ^0.34.5 | Image processing | Resize regenerated images to 1200x1200 (already in image-generator.ts) |
| `mode-watcher` | ^0.5.0 | Theme toggle | Already integrated; review modal inherits theme automatically |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Bits UI Dialog | Custom modal with `<dialog>` HTML element | Native `<dialog>` is simpler but lacks compound component pattern, focus trap, and portal; Bits UI already installed |
| SvelteKit form actions for updates | REST API PATCH endpoints | Form actions provide progressive enhancement and data invalidation; use for status changes. Use PATCH/POST for regeneration (async operations) |
| `navigator.clipboard.writeText()` | `document.execCommand('copy')` | `execCommand` is deprecated; `writeText` has >96% browser support, only requires HTTPS |
| `<a download>` for image download | Supabase `storage.download()` → Blob URL | Direct `<a download>` works for same-origin public URLs; Supabase public URLs may be cross-origin, so fetch + Blob is the safer pattern |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended File Structure (Phase 4 additions)

```
src/
  routes/
    dashboard/
      +page.svelte          # MODIFY: Replace mock data with server-loaded stats + upcoming posts
      +page.server.ts        # NEW: Load dashboard stats + upcoming posts from DB
      calendar/
        +page.svelte         # MODIFY: Replace mock imports with server data
        +page.server.ts      # NEW: Load posts for current month/week from DB
      editor/
        +page.svelte         # MODIFY: Replace mock data, add real post editing
        +page.server.ts      # NEW: Load single post or latest post for editing
      publishing/
        +page.svelte         # MODIFY: Replace kanban mock with real posts grouped by status
        +page.server.ts      # NEW: Load posts grouped by status
    api/
      posts/
        [id]/
          +server.ts         # NEW: PATCH for status/content updates
          regenerate/
            +server.ts       # NEW: POST for copy/image/both regeneration
  lib/
    components/
      dashboard/
        post-review-dialog.svelte  # NEW: Bits UI Dialog with full post review/edit UI
        copy-toast.svelte          # NEW: Small transient "Copied!" notification
        calendar-grid.svelte       # MODIFY: Accept real post data instead of mock CalendarEvent
        content-chip.svelte        # MODIFY: Update status colors to match real post_status enum
        post-card.svelte           # MODIFY: Wire actions (approve/reject/download) to real endpoints
    data/
      mock-calendar.ts       # DEPRECATED: No longer imported by calendar page
      mock-overview.ts       # DEPRECATED: No longer imported by overview page
      mock-publishing.ts     # DEPRECATED: No longer imported by publishing page
      mock-editor.ts         # DEPRECATED: No longer imported by editor page
  server/
    db/
      schema.ts              # MODIFY: Add 'published' to postStatusEnum, add rejectionReason + publishedAt columns
```

### Pattern 1: Server Load → Real Data (Calendar Example)

**What:** Replace mock data imports with `+page.server.ts` that queries the database and passes typed data to the page component.

**When to use:** Every dashboard page that currently imports from `$lib/data/mock-*.ts`.

**Example:**
```typescript
// src/routes/dashboard/calendar/+page.server.ts
import { db } from '$lib/server/db';
import { posts, contentPlans } from '$lib/server/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { product } = await parent();
  if (!product) return { posts: [] };

  // Load current month range of posts
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const calendarPosts = await db.query.posts.findMany({
    where: and(
      eq(posts.productId, product.id),
      gte(posts.scheduledAt, monthStart),
      lte(posts.scheduledAt, monthEnd)
    ),
    columns: {
      id: true,
      topic: true,
      status: true,
      scheduledAt: true,
      platform: true,
      postType: true,
      imageUrl: true,
      contentCategory: true
    },
    orderBy: posts.scheduledAt
  });

  return {
    posts: calendarPosts.map(p => ({
      ...p,
      scheduledAt: p.scheduledAt?.toISOString() ?? null
    }))
  };
};
```

### Pattern 2: Post Update via PATCH API Endpoint

**What:** A single PATCH endpoint that handles all post field updates (status, copyText, hashtags, scheduledAt, rejectionReason) with Zod validation.

**When to use:** REVW-02 through REVW-07, REVW-11, EXPT-03.

**Example:**
```typescript
// src/routes/api/posts/[id]/+server.ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { posts, products } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const updateSchema = z.object({
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected', 'scheduled', 'published']).optional(),
  copyText: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
  rejectionReason: z.string().optional()
}).refine(
  data => !(data.status === 'rejected' && !data.rejectionReason),
  { message: 'rejectionReason is required when rejecting' }
);

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
  const user = await locals.getUser();
  if (!user) return error(401, 'Unauthorized');

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return error(400, parsed.error.message);

  // Verify ownership: post -> product -> userId
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, params.id),
    with: { product: { columns: { userId: true } } }
  });

  if (!post || post.product.userId !== user.id) {
    return error(404, 'Post not found');
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.copyText !== undefined) updates.copyText = parsed.data.copyText;
  if (parsed.data.hashtags !== undefined) updates.hashtags = parsed.data.hashtags;
  if (parsed.data.scheduledAt) updates.scheduledAt = new Date(parsed.data.scheduledAt);
  if (parsed.data.rejectionReason) updates.rejectionReason = parsed.data.rejectionReason;
  if (parsed.data.status === 'published') updates.publishedAt = new Date();

  await db.update(posts).set(updates).where(eq(posts.id, params.id));

  return json({ success: true });
};
```

### Pattern 3: Single-Post Regeneration (Reuse Phase 3 Pipeline)

**What:** An endpoint that regenerates copy, image, or both for a single post by calling the existing `generatePostCopy` and `generatePostImage` functions directly.

**When to use:** REVW-08, REVW-09, REVW-10.

**Example:**
```typescript
// src/routes/api/posts/[id]/regenerate/+server.ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { posts, products } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generatePostCopy } from '$lib/server/ai/pipeline/copy-generator';
import { generatePostImage } from '$lib/server/ai/pipeline/image-generator';
import { getCachedBrandAnalysis } from '$lib/server/ai/pipeline/brand-analyzer';
import { assembleBrief } from '$lib/server/ai/pipeline/brief-assembler';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const regenSchema = z.object({
  type: z.enum(['copy', 'image', 'both'])
});

export const POST: RequestHandler = async ({ locals, params, request }) => {
  const user = await locals.getUser();
  if (!user) return error(401, 'Unauthorized');

  const body = await request.json();
  const parsed = regenSchema.safeParse(body);
  if (!parsed.success) return error(400, parsed.error.message);

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, params.id),
    with: { product: true }
  });

  if (!post || post.product.userId !== user.id) {
    return error(404, 'Post not found');
  }

  const brief = await assembleBrief(post.productId!);
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (parsed.data.type === 'copy' || parsed.data.type === 'both') {
    const copy = await generatePostCopy(
      { topic: post.topic, contentCategory: post.contentCategory, keyMessage: post.keyMessage },
      brief
    );
    updates.copyText = copy.fullText;
    updates.hashtags = copy.hashtags;
  }

  if (parsed.data.type === 'image' || parsed.data.type === 'both') {
    const imageAssets = brief.assets.filter(a => a.tag !== 'testimonial').map(a => a.fileUrl);
    const brandAnalysis = imageAssets.length > 0
      ? await getCachedBrandAnalysis(post.productId!, imageAssets)
      : { primaryColors: ['#1a1a2e'], secondaryColors: ['#0f3460'], visualStyle: 'minimalist', typography: 'sans-serif', mood: 'professional', patterns: 'clean lines', imageStyleGuide: 'professional imagery' };

    const result = await generatePostImage(post.topic, post.keyMessage, brandAnalysis, post.productId!, post.id);
    updates.imageUrl = result.imageUrl;
    updates.imagePrompt = result.imagePrompt;
  }

  // Reset status to pending_review after regeneration
  updates.status = 'pending_review';

  await db.update(posts).set(updates).where(eq(posts.id, params.id));

  return json({ success: true });
};
```

### Pattern 4: Clipboard Copy + Image Download (Client-Side)

**What:** Copy post text to clipboard and download images using browser APIs.

**When to use:** EXPT-01, EXPT-02.

**Example:**
```typescript
// Clipboard copy with feedback
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    showCopiedToast = true;
    setTimeout(() => { showCopiedToast = false; }, 2000);
  } catch {
    // Fallback for non-HTTPS dev environment
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showCopiedToast = true;
    setTimeout(() => { showCopiedToast = false; }, 2000);
  }
}

// Image download via fetch + Blob (handles cross-origin Supabase URLs)
async function downloadImage(url: string, filename: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(blobUrl);
}
```

### Pattern 5: Dashboard Stats via Aggregate Queries

**What:** Use Drizzle's `count()` and SQL aggregation to compute dashboard statistics.

**When to use:** DASH-01, DASH-02, DASH-03.

**Example:**
```typescript
// src/routes/dashboard/+page.server.ts
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq, and, gte, lte, count, sql } from 'drizzle-orm';
import { addDays, startOfDay } from 'date-fns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { product } = await parent();
  if (!product) return { stats: null, upcoming: [] };

  const now = new Date();
  const weekFromNow = addDays(now, 7);

  // Quick stats: count by status
  const statusCounts = await db
    .select({
      status: posts.status,
      count: count()
    })
    .from(posts)
    .where(eq(posts.productId, product.id))
    .groupBy(posts.status);

  const stats = {
    generated: statusCounts.reduce((sum, s) => sum + s.count, 0),
    approved: statusCounts.find(s => s.status === 'approved')?.count ?? 0,
    pendingReview: statusCounts.find(s => s.status === 'pending_review')?.count ?? 0,
    published: statusCounts.find(s => s.status === 'published')?.count ?? 0
  };

  // Upcoming posts for next 7 days
  const upcoming = await db.query.posts.findMany({
    where: and(
      eq(posts.productId, product.id),
      gte(posts.scheduledAt, startOfDay(now)),
      lte(posts.scheduledAt, weekFromNow)
    ),
    columns: {
      id: true, topic: true, status: true, scheduledAt: true, platform: true, postType: true
    },
    orderBy: posts.scheduledAt,
    limit: 10
  });

  return {
    stats,
    upcoming: upcoming.map(p => ({
      ...p,
      scheduledAt: p.scheduledAt?.toISOString() ?? null
    }))
  };
};
```

### Anti-Patterns to Avoid

- **Do not create new mock data files.** Phase 4 replaces mock data with real data. All 4 mock files become unused.
- **Do not call AI regeneration from the client.** All AI calls (copy, image) must go through server endpoints. API keys must never reach the browser.
- **Do not use synchronous AI calls in form actions.** Regeneration can take 5-30 seconds. Use fire-and-forget with loading states, or at minimum show a spinner while the PATCH completes. Consider returning immediately with a pending state and polling.
- **Do not fetch the full post list on every page.** Calendar loads only the visible month range. Dashboard loads only next 7 days + stats. Publishing loads posts by status.
- **Do not skip ownership verification.** Every API endpoint must verify `post -> product -> userId === session.userId` before allowing updates.
- **Do not download images via `window.open(url)`.** This opens a new tab instead of downloading. Use fetch + Blob URL + `<a download>` pattern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Post review modal | Custom overlay + backdrop + focus trap | Bits UI `Dialog` compound component | Accessible, focus-trapped, portal-rendered, keyboard navigation handled |
| Copy-to-clipboard | Custom execCommand wrapper | `navigator.clipboard.writeText()` | Standard API, 96%+ browser support, Promise-based |
| Date formatting for calendar | Manual `toLocaleDateString` chains | `date-fns` `format`, `startOfMonth`, `endOfMonth` | Already installed; timezone-aware, tree-shakeable |
| Post status color mapping | Hardcoded if/else chains | CSS custom properties keyed by status | Centralizes theming, works with dark/light mode |
| Single-post regeneration | New AI pipeline code | Reuse `generatePostCopy` / `generatePostImage` from Phase 3 | Already tested, handles batching, uploads to Supabase Storage |
| Request body validation | Manual if/else checks | Zod schemas (already installed) | Type-safe, composable, consistent with Phase 3 patterns |

**Key insight:** Phase 4 is primarily a data-wiring and UI-refinement phase. The hard AI work was done in Phase 3. The hard UI work was done in Phase 5. Phase 4 connects them.

## Common Pitfalls

### Pitfall 1: Stale Data After Status Change

**What goes wrong:** User approves a post in the review modal, but the calendar/publishing view still shows the old status.
**Why it happens:** SvelteKit doesn't automatically invalidate data after a `fetch()` call to an API endpoint (only form actions with `use:enhance` auto-invalidate).
**How to avoid:** After any API call that changes post data, call `invalidateAll()` from `$app/navigation` to refetch all server loads. Or use form actions with `use:enhance` for status changes.
**Warning signs:** Manual `fetch()` calls to PATCH endpoints without corresponding `invalidateAll()`.

### Pitfall 2: Post Status Enum Migration Failure

**What goes wrong:** Adding 'published' to `postStatusEnum` in schema.ts doesn't automatically update the PostgreSQL enum.
**Why it happens:** Drizzle's `drizzle-kit push` handles enum additions since drizzle-kit 0.26.2, but the user must run the migration command.
**How to avoid:** Document the migration step clearly: `pnpm drizzle-kit push` after schema change. Alternatively, use `drizzle-kit generate` + `drizzle-kit migrate` for explicit migration files.
**Warning signs:** Runtime errors like `invalid input value for enum post_status: "published"`.

### Pitfall 3: Regeneration Blocks the UI

**What goes wrong:** User clicks "Regenerate Image" and the UI freezes for 10-15 seconds while the AI generates.
**Why it happens:** The regeneration endpoint is synchronous -- it waits for the AI call to complete before responding.
**How to avoid:** Show a loading spinner immediately on click. The regeneration endpoint can be synchronous (it's one post, not 12), but the client must show feedback. Alternatively, use the existing job/SSE pattern for consistency.
**Warning signs:** No loading state on regeneration buttons; user can click multiple times.

### Pitfall 4: Calendar Grid Not Reactive to Month Navigation

**What goes wrong:** The existing `calendar-grid.svelte` computes dates from `new Date()` at component creation time and never updates when the user navigates months.
**Why it happens:** The current mock calendar is static -- it always shows the current month. With real data, users will want to browse forward/backward.
**How to avoid:** Lift `year` and `month` to reactive `$state` variables. Add navigation buttons (prev/next month). When month changes, the `$derived.by()` grid recomputes. Load data for the new month range (this may require a client-side `fetch` or a URL parameter to trigger server reload).
**Warning signs:** No prev/next month navigation; hardcoded `new Date()` in the calendar grid.

### Pitfall 5: Cross-Origin Image Download Failure

**What goes wrong:** `<a href={imageUrl} download>` doesn't trigger a download but instead opens the image in a new tab.
**Why it happens:** The `download` attribute is ignored for cross-origin URLs (Supabase Storage URLs are on a different domain).
**How to avoid:** Fetch the image as a Blob, create an Object URL, and trigger download via a dynamically created `<a>` element. Remember to revoke the Object URL afterward.
**Warning signs:** Using `<a download>` directly with Supabase public URLs without testing cross-origin behavior.

### Pitfall 6: Rejection Without Reason

**What goes wrong:** User can reject a post without providing a reason, leading to empty `rejectionReason` fields that provide no actionable feedback.
**Why it happens:** The reject action doesn't enforce the reason field on the client or server.
**How to avoid:** Zod validation on the PATCH endpoint requires `rejectionReason` when `status === 'rejected'`. On the client, show a textarea that must be filled before the reject button is enabled.
**Warning signs:** Reject button submits without any reason input visible.

## Code Examples

### Schema Changes Required

```typescript
// Changes to src/lib/server/db/schema.ts

// 1. Add 'published' to postStatusEnum
export const postStatusEnum = pgEnum('post_status', [
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'scheduled',
  'published'  // NEW for EXPT-03
]);

// 2. Add new columns to posts table
export const posts = pgTable('posts', {
  // ... existing columns ...
  rejectionReason: text('rejection_reason'),  // NEW for REVW-07
  publishedAt: timestamp('published_at', { withTimezone: true }),  // NEW for EXPT-03
});
```

### Status Color Map for Calendar/Publishing

```typescript
// Shared status → color mapping (CSS variable references)
export const postStatusColors: Record<string, { color: string; bg: string; label: string }> = {
  draft:          { color: 'var(--text-muted)',   bg: 'rgba(156,163,175,0.1)', label: 'Draft' },
  pending_review: { color: 'var(--c-secondary)',  bg: 'rgba(249,115,22,0.1)',  label: 'Review' },
  approved:       { color: 'var(--c-electric)',   bg: 'rgba(6,182,212,0.1)',   label: 'Approved' },
  scheduled:      { color: '#22c55e',             bg: 'rgba(34,197,94,0.1)',   label: 'Scheduled' },
  published:      { color: '#16a34a',             bg: 'rgba(22,163,74,0.1)',   label: 'Published' },
  rejected:       { color: 'var(--negative)',     bg: 'rgba(239,68,68,0.1)',   label: 'Rejected' }
};
```

### Bits UI Post Review Dialog

```svelte
<!-- src/lib/components/dashboard/post-review-dialog.svelte -->
<script lang="ts">
  import { Dialog } from 'bits-ui';
  import { X, Copy, Download, RefreshCw, Check, Ban } from 'lucide-svelte';
  import { invalidateAll } from '$app/navigation';

  let { post, open = $bindable(false) }: {
    post: { id: string; topic: string; copyText: string | null; hashtags: string[] | null; imageUrl: string | null; scheduledAt: string | null; status: string };
    open: boolean;
  } = $props();

  let editedCopy = $state(post.copyText ?? '');
  let editedHashtags = $state<string[]>(post.hashtags ?? []);
  let saving = $state(false);

  async function approve() {
    saving = true;
    await fetch(`/api/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved', copyText: editedCopy, hashtags: editedHashtags })
    });
    await invalidateAll();
    saving = false;
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 bg-black/50 z-40" />
    <Dialog.Content class="fixed inset-4 md:inset-[10%] z-50 rounded-2xl overflow-y-auto"
      style="background: var(--bg-surface); border: 1px solid var(--border-subtle);">
      <Dialog.Title class="text-lg font-bold p-6" style="color: var(--text-main);">
        {post.topic}
      </Dialog.Title>
      <!-- Post content, edit fields, action buttons -->
      <Dialog.Close class="absolute top-4 right-4">
        <X class="w-5 h-5" />
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Image Download Helper

```typescript
// Client-side image download (handles cross-origin)
export async function downloadImage(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Mock data files imported directly | `+page.server.ts` loads from DB | Phase 4 transition | Dashboard becomes functional with real data |
| Static calendar (current month only) | Navigable calendar with month prev/next | Phase 4 | Users can browse past/future content |
| No post editing capability | Full edit + approve workflow | Phase 4 | Core review loop becomes usable |
| `document.execCommand('copy')` | `navigator.clipboard.writeText()` | 2020+ | Modern async API, Promise-based, standard |

**No deprecated patterns apply to Phase 4.** All tools and APIs used are current and stable.

## Open Questions

1. **Calendar Month Navigation: Server vs. Client Fetch**
   - What we know: The current calendar grid computes dates client-side from `new Date()`. Data comes from server load.
   - What's unclear: When the user clicks "Next Month", should we (a) use URL search params to trigger a new server load (`?month=2026-03`), or (b) fetch data client-side via API call?
   - Recommendation: Use URL search params (`?month=2026-03`). SvelteKit will re-run the server load when URL params change, keeping the pattern consistent with SvelteKit conventions. The `$page.url.searchParams` reactive store triggers re-evaluation.

2. **Regeneration: Synchronous vs. Background Job**
   - What we know: Batch generation (12 posts) uses background jobs + SSE. Single-post regeneration is much faster (one AI call).
   - What's unclear: Is single-post regeneration fast enough to be synchronous (~5-15 seconds)?
   - Recommendation: Use synchronous endpoints (no job/SSE) for single-post regeneration. Show a loading spinner on the button. Copy regeneration takes ~2-3 seconds. Image regeneration takes ~5-10 seconds. This is acceptable with a spinner and is dramatically simpler than the job pattern. If it proves too slow, switch to the job pattern later.

3. **Editor Page Purpose: Post List or Single Post?**
   - What we know: The mock editor shows one post with variants. The real workflow needs the user to click a specific post to edit.
   - What's unclear: Should `/dashboard/editor` show a list of posts to pick from, or should it only open when navigated to from another page (calendar, publishing)?
   - Recommendation: Make the editor page accessible via `/dashboard/editor?postId=xxx`. The review dialog (Bits UI) handles quick approve/reject from calendar and publishing views. The full editor page handles deep editing with the 3-panel layout. Both can coexist: quick review modal for status changes, full editor for detailed editing.

4. **Publishing Page Kanban: Keep or Simplify?**
   - What we know: The mock publishing page has a 4-column Kanban board (drafts, review, scheduled, published).
   - What's unclear: With no auto-publishing, "scheduled" and "published" are somewhat artificial. Posts go from "approved" to "published" when the user manually marks them.
   - Recommendation: Keep the Kanban but adjust columns: Draft | Pending Review | Approved | Published. The "Approved" column shows posts ready for manual publishing (with copy/download buttons). "Published" shows manually-marked-as-published posts.

## Sources

### Primary (HIGH confidence)
- **Existing codebase** (highest authority) - `src/lib/server/db/schema.ts`, `src/lib/server/ai/pipeline/*.ts`, `src/routes/dashboard/**/*`, `src/lib/components/dashboard/*`, `src/lib/data/mock-*.ts` -- all reviewed in full
- [Bits UI Dialog documentation](https://bits-ui.com/docs/components/dialog) - Dialog compound component API, focus trap, portal, accessibility
- [SvelteKit Form Actions](https://svelte.dev/docs/kit/form-actions) - `use:enhance`, progressive enhancement, data invalidation
- [MDN Clipboard API: writeText()](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) - Browser support (Chrome 66+, Firefox 63+, Safari 13.1+), HTTPS requirement
- [Can I Use: Clipboard writeText](https://caniuse.com/mdn-api_clipboard_writetext) - 96%+ global browser support
- [Supabase Storage: Download](https://supabase.com/docs/reference/javascript/storage-from-download) - Blob download pattern for private files, `getPublicUrl` for public access

### Secondary (MEDIUM confidence)
- [Drizzle ORM Enum Handling](https://github.com/drizzle-team/drizzle-orm/discussions/3192) - drizzle-kit 0.26.2+ supports adding enum values via push/generate
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations) - Migration commands and push workflow
- [SvelteKit Progressive Enhancement Guide](https://joyofcode.xyz/sveltekit-progressive-enhancement) - `use:enhance` callback patterns for optimistic UI

### Tertiary (LOW confidence)
- None -- Phase 4 uses only existing, well-documented technologies already in the project

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries; everything already installed and tested in Phases 2/3/5
- Architecture: HIGH - Patterns directly follow existing codebase conventions (server loads, API endpoints, Drizzle queries)
- Schema changes: HIGH - Simple additions (`published` enum value, 2 new columns) with established Drizzle migration workflow
- Regeneration: HIGH - Directly reuses Phase 3 functions (`generatePostCopy`, `generatePostImage`)
- Export (clipboard/download): HIGH - Standard browser APIs with >96% support
- Pitfalls: HIGH - Based on direct codebase analysis (found real issues: cross-origin download, stale data after fetch)

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days -- stable domain, no fast-moving external dependencies)
