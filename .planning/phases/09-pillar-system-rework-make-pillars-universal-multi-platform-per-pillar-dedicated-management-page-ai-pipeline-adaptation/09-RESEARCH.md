# Phase 9: Pillar System Rework - Research

**Researched:** 2026-03-02
**Domain:** Database schema migration, SvelteKit UI, AI prompt engineering
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Pillars available for ALL product types (personal_brand, product, service), not just personal_brand
- Remove the conditional rendering that hides pillars for non-personal_brand types
- Keep 5-pillar limit per product (strategic constraint, not technical)
- Pillar model: name + description + platforms[] (NO separate tone field)
- Tone is derived from platform specs + pillar description (AI interprets tone from context)
- Many-to-many relationship: one pillar can target multiple platforms
- Schema change: add pillar_platforms junction table, remove single `platform` column from contentPillars
- One content idea per pillar, adapted separately per platform
- AI generates SEPARATE posts per platform for each pillar (not cross-posting same text)
- Platform specs handle format constraints (char limits, hashtags, thread structure)
- Pillar description carries implicit tone that AI blends with platform guidelines
- Dedicated `/dashboard/pillars` page (NOT inside /dashboard/brand -- pillars are strategy, brand is identity)
- Card-based pillar editor with: name, description, multi-platform selection
- Visual indicator of which platforms each pillar targets
- Ability to reorder, add, remove pillars
- Keep pillar editing in onboarding flow too (deep-brief step) but also accessible from dashboard

### Claude's Discretion
- Junction table naming and column structure
- Migration strategy for existing single-platform pillar data
- Exact card layout and interaction patterns for pillar management page
- How the generate page displays multi-platform pillar information
- Sidebar navigation item placement for pillars page

### Deferred Ideas (OUT OF SCOPE)
- Pillar analytics/performance tracking per platform
- AI-suggested pillar names based on product type (beyond current pre-suggestions)
- Pillar templates or presets
</user_constraints>

## Summary

This phase transforms the content pillar system from a single-platform-per-pillar model restricted to personal brands into a universal, many-to-many pillar-platform system with a dedicated management page. The rework touches four layers: database schema (junction table migration), server-side data access (brief assembler, plan/post generation), AI prompts (multi-platform adaptation per pillar), and frontend UI (new pillar management page, updated onboarding, updated generate page, sidebar addition).

The current system stores a single `platform` text column on `content_pillars` and conditionally shows pillars only when `productType === 'personal_brand'`. The rework replaces this with a `pillar_platforms` junction table (many-to-many), removes the personal-brand gate, and updates the AI pipeline to generate one content idea per pillar with separate platform-adapted posts for each linked platform.

**Primary recommendation:** Use the Drizzle ORM v1 `relations()` API (matching the existing codebase pattern) for the junction table, migrate existing data with a SQL migration that copies current platform assignments, and restructure the AI plan prompt to generate N posts per pillar where N = number of platforms linked to that pillar.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | ^0.45.1 | ORM for schema + relational queries | Already in project, v1 relations API throughout |
| drizzle-kit | ^0.31.9 | Migration generation | Already in project, `drizzle-kit generate` for SQL migrations |
| SvelteKit 2 | Current | Page routing, server load, form actions | Already in project |
| Svelte 5 | Current | Runes-based UI ($state, $derived, $props) | Already in project |
| Bits UI | Current | Dialog, Popover components | Already used in generate page and review dialog |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-svelte | Current | Icons | Already used throughout dashboard |
| Paraglide | Current | i18n (en/es) | All user-facing text |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| v1 relations() | v2 defineRelations() with through() | v2 syntax is cleaner for M2M but would require migrating ALL existing relations, too risky for this phase |
| Composite primary key on junction | UUID primary key + unique constraint | UUID is consistent with all other tables in the project |

**Installation:** No new packages needed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/server/db/
│   ├── schema.ts              # Add pillarPlatforms junction table, update relations
│   └── migrations/
│       └── 0005_*.sql         # Add junction table, migrate data, drop platform column
├── lib/server/ai/
│   ├── pipeline/
│   │   ├── brief-assembler.ts # Update AssembledBrief to include platforms[] per pillar
│   │   ├── plan-generator.ts  # Adjust post count calculation for multi-platform pillars
│   │   └── post-generator.ts  # No changes needed (already platform-aware)
│   ├── prompts/
│   │   ├── plan-system.ts     # Rewrite pillar section for multi-platform per pillar
│   │   └── copy-system.ts     # No changes needed (already receives platform)
│   └── platform-specs.ts      # No changes needed
├── routes/dashboard/
│   ├── pillars/
│   │   ├── +page.server.ts    # CRUD for pillars with platform junction
│   │   └── +page.svelte       # Dedicated pillar management page
│   ├── onboarding/deep-brief/
│   │   ├── +page.server.ts    # Update pillar save to use junction table
│   │   └── +page.svelte       # Replace single-platform dropdown with multi-select
│   ├── generate/
│   │   ├── +page.server.ts    # Include platform data in pillar query
│   │   └── +page.svelte       # Show platform badges per pillar in picker
│   └── settings/[id]/
│       ├── +page.server.ts    # Update platform editing to use junction table
│       └── +page.svelte       # Update platform section
├── lib/components/dashboard/
│   └── sidebar.svelte         # Add pillars nav item
└── messages/
    ├── en.json                # New i18n keys for pillars page
    └── es.json                # Spanish translations
```

### Pattern 1: Junction Table with v1 Relations (Drizzle ORM)
**What:** Many-to-many between contentPillars and platforms via a pillarPlatforms junction table
**When to use:** This phase -- the only M2M pattern in the project
**Example:**
```typescript
// Source: Drizzle ORM docs, adapted to project conventions
export const pillarPlatforms = pgTable('pillar_platforms', {
  id: uuid('id').primaryKey().defaultRandom(),
  pillarId: uuid('pillar_id')
    .references(() => contentPillars.id, { onDelete: 'cascade' })
    .notNull(),
  platform: text('platform').notNull(), // 'linkedin' | 'x'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// Relations (v1 style, consistent with existing codebase)
export const contentPillarsRelations = relations(contentPillars, ({ one, many }) => ({
  product: one(products, {
    fields: [contentPillars.productId],
    references: [products.id]
  }),
  pillarPlatforms: many(pillarPlatforms)
}));

export const pillarPlatformsRelations = relations(pillarPlatforms, ({ one }) => ({
  pillar: one(contentPillars, {
    fields: [pillarPlatforms.pillarId],
    references: [contentPillars.id]
  })
}));
```

### Pattern 2: Relational Query with Junction Table (v1 style)
**What:** Querying pillars with their platforms using the junction table
**When to use:** Every place that reads pillars (brief assembler, generate page, settings, etc.)
**Example:**
```typescript
// Source: Drizzle ORM v1 relational queries docs
const pillars = await db.query.contentPillars.findMany({
  where: eq(contentPillars.productId, productId),
  orderBy: [asc(contentPillars.sortOrder)],
  with: {
    pillarPlatforms: {
      columns: { platform: true }
    }
  }
});
// Result: each pillar has pillarPlatforms: [{ platform: 'linkedin' }, { platform: 'x' }]
// Flatten: pillar.platforms = pillar.pillarPlatforms.map(pp => pp.platform)
```

### Pattern 3: Delete-All-Then-Insert for Pillar Save (Existing Pattern)
**What:** When saving pillars, delete existing and re-insert (already used in deep-brief)
**When to use:** Both the onboarding deep-brief save and the new /dashboard/pillars save
**Example:**
```typescript
// Existing pattern from deep-brief +page.server.ts
await db.delete(contentPillars).where(eq(contentPillars.productId, product.id));
// Junction rows cascade-deleted automatically due to onDelete: 'cascade' on pillarPlatforms.pillarId
if (pillarItems.length > 0) {
  const insertedPillars = await db.insert(contentPillars).values(
    pillarItems.map((p, i) => ({
      productId: product.id,
      name: p.name,
      description: p.description || null,
      sortOrder: i
    }))
  ).returning();

  // Insert junction rows
  const junctionRows = insertedPillars.flatMap((pillar, i) =>
    pillarItems[i].platforms.map((platform: string) => ({
      pillarId: pillar.id,
      platform
    }))
  );
  if (junctionRows.length > 0) {
    await db.insert(pillarPlatforms).values(junctionRows);
  }
}
```

### Pattern 4: Multi-Platform Post Generation Per Pillar
**What:** AI generates N posts per pillar where N = number of platforms linked
**When to use:** Plan system prompt and post count calculation
**Example:**
```typescript
// In plan system prompt:
// "Pillar 'Personal CFO' targets LinkedIn + X = 2 posts for this pillar"
// "Pillar 'Industry Insights' targets LinkedIn only = 1 post for this pillar"

// Post count calculation:
const totalPillarPosts = selectedPillars.reduce((sum, p) =>
  sum + Math.max(1, p.platforms.length), 0
);
const minPosts = Math.max(4, totalPillarPosts);
const maxPosts = Math.min(20, totalPillarPosts * 2);
```

### Pattern 5: Removing the Personal Brand Gate
**What:** Pillars shown for ALL product types, not just personal_brand
**When to use:** Deep brief onboarding page, generate page, brand page
**Key changes:**
```svelte
<!-- BEFORE (gated): -->
{#if data.productType === 'personal_brand'}
  <!-- pillar section -->
{:else}
  <!-- product details section -->
{/if}

<!-- AFTER (universal): -->
<!-- pillar section always shown -->
<!-- product details section also shown for product/service types -->
```

### Anti-Patterns to Avoid
- **Storing platforms as JSON array on contentPillars:** Breaks normalization, makes queries for "all pillars targeting LinkedIn" expensive. Use junction table as decided.
- **Using defineRelations() v2 API:** The existing codebase uses v1 `relations()` throughout. Mixing APIs or migrating all relations is unnecessary risk.
- **Separate API endpoint for pillar CRUD:** Pillars are simple enough for SvelteKit form actions. No REST API needed.
- **Modifying existing migration files:** Always generate new migration files. Never edit 0000-0004.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Data migration (single platform -> junction) | Manual SQL scripts run ad-hoc | Drizzle-kit generated migration with custom SQL | Tracked, reproducible, part of migration chain |
| Multi-select platform UI | Custom checkbox group from scratch | Existing platformOptions pattern from deep-brief + toggle logic | Already battle-tested in the codebase |
| Platform validation | Custom validation logic | ACTIVE_PLATFORMS set from platform-specs.ts | Single source of truth already exists |
| Cascade deletion | Manual junction cleanup | PostgreSQL `ON DELETE CASCADE` on foreign key | Database handles it automatically |

**Key insight:** The existing codebase already has all the UI patterns (tag inputs, platform dropdowns, card editors) and data access patterns (delete-all-insert, relational queries) needed. This phase is about rewiring existing patterns, not building new ones.

## Common Pitfalls

### Pitfall 1: Orphaned Junction Rows After Pillar Deletion
**What goes wrong:** Deleting a pillar leaves orphaned rows in pillar_platforms
**Why it happens:** Missing CASCADE constraint on foreign key
**How to avoid:** Define `onDelete: 'cascade'` on `pillarPlatforms.pillarId` reference. Already part of the schema design above.
**Warning signs:** Junction table growing indefinitely, platform counts don't match

### Pitfall 2: Plan Prompt Not Matching Platform to Pillar
**What goes wrong:** AI generates a LinkedIn-style post for a pillar that only targets X
**Why it happens:** Prompt doesn't clearly enforce platform-pillar binding
**How to avoid:** The plan system prompt MUST explicitly list each pillar with its platforms, and the instruction must say "generate one post PER PLATFORM for each pillar, with the post's platform field matching"
**Warning signs:** Posts with mismatched platform vs. pillar target

### Pitfall 3: Post Count Explosion with Many Platforms
**What goes wrong:** A pillar with 2 platforms doubles its post count. 5 pillars x 2 platforms = 10 posts minimum, potentially overwhelming
**Why it happens:** Linear scaling of posts with platforms
**How to avoid:** Cap maxPosts at a reasonable limit (e.g., 20). The user already accepted 5 pillars x potentially 2 platforms = 10 posts. Current max is 12, may need adjustment.
**Warning signs:** Content plans with too many posts, generation taking very long

### Pitfall 4: Breaking Existing Pillar Data During Migration
**What goes wrong:** Existing pillars lose their platform assignment during schema migration
**Why it happens:** Dropping the `platform` column before copying data to junction table
**How to avoid:** Migration sequence: (1) CREATE junction table, (2) INSERT INTO junction from existing platform column WHERE platform IS NOT NULL, (3) DROP platform column from content_pillars
**Warning signs:** All pillars showing no platforms after migration

### Pitfall 5: Onboarding Deep Brief Regression
**What goes wrong:** Pillar section in onboarding breaks because it was gated behind personal_brand check
**Why it happens:** Removing the `{#if data.productType === 'personal_brand'}` guard without restructuring the form section order
**How to avoid:** Keep pillar section AND product details section both visible for product/service types. For personal_brand, keep existing behavior where product detail fields are nulled out.
**Warning signs:** Product/service onboarding missing pillars, or personal_brand showing product detail fields

### Pitfall 6: Generate Page Pillar Picker Not Showing Platforms
**What goes wrong:** The pillar picker popover on the generate page doesn't indicate which platforms each pillar targets
**Why it happens:** The generate page load function only fetches `{ id, name, platform }` -- needs to fetch junction data
**How to avoid:** Update the generate page server load to query pillars with their junction platform rows, pass platforms array to client
**Warning signs:** User can't tell which platforms a pillar targets when selecting for generation

## Code Examples

### Migration SQL (Data Migration Strategy)
```sql
-- Step 1: Create junction table
CREATE TABLE "pillar_platforms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "pillar_id" uuid NOT NULL REFERENCES "content_pillars"("id") ON DELETE CASCADE,
  "platform" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Step 2: Migrate existing platform assignments to junction table
INSERT INTO "pillar_platforms" ("pillar_id", "platform")
SELECT "id", "platform" FROM "content_pillars" WHERE "platform" IS NOT NULL;

-- Step 3: Drop the old platform column
ALTER TABLE "content_pillars" DROP COLUMN "platform";
```

### Updated AssembledBrief Interface
```typescript
export interface AssembledBrief {
  // ... existing fields ...
  contentPillars: Array<{
    id: string;        // NEW: needed for pillar selection
    name: string;
    description: string | null;
    sortOrder: number;
    platforms: string[]; // CHANGED: was single `platform: string | null`
  }>;
}
```

### Updated Plan System Prompt (Pillar Section)
```typescript
if (brief.contentPillars.length > 0) {
  const pillarLines = brief.contentPillars.map((p, i) => {
    const platformNames = p.platforms.length > 0
      ? p.platforms.map(slug => getPlatformSpec(slug).displayName).join(', ')
      : 'LinkedIn (default)';
    return `${i + 1}. **${p.name}**${p.description ? `: ${p.description}` : ''} [Platforms: ${platformNames}]`;
  });

  sections.push(`## Content Pillars
Distribute posts across these content pillars. For each pillar, generate ONE post PER PLATFORM it targets.
${pillarLines.join('\n')}

IMPORTANT: Each post's platform field MUST match one of its pillar's target platforms.
If a pillar targets multiple platforms, generate separate posts for each platform with content adapted to that platform's native style.
If a pillar has no platforms, default to linkedin.`);
}
```

### Pillar Card Component Pattern (Dashboard)
```svelte
<!-- Card-based editor pattern for /dashboard/pillars -->
<div class="rounded-xl p-4" style="background: var(--input-bg); border: 1px solid var(--border-subtle);">
  <input type="text" bind:value={pillar.name} placeholder="Pillar name" />
  <textarea bind:value={pillar.description} placeholder="Description" rows="2" />

  <!-- Multi-platform toggle chips -->
  <div class="flex gap-2 mt-3">
    {#each activePlatforms as platform}
      {@const selected = pillar.platforms.includes(platform.slug)}
      <button
        type="button"
        onclick={() => togglePlatform(pillarIndex, platform.slug)}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        style="
          background: {selected ? 'var(--c-electric-glow)' : 'var(--bg-surface-alt)'};
          color: {selected ? 'var(--c-electric)' : 'var(--text-dim)'};
          border: 1px solid {selected ? 'var(--c-electric)' : 'var(--border-subtle)'};
        "
      >
        {platform.displayName}
      </button>
    {/each}
  </div>
</div>
```

### Sidebar Navigation Update
```typescript
// In sidebar.svelte sections array, add to "Main" section:
{
  label: () => m.dash_nav_section_main(),
  items: [
    { href: '/dashboard', label: () => m.dash_nav_overview(), icon: LayoutDashboard },
    { href: '/dashboard/calendar', label: () => m.dash_nav_calendar(), icon: CalendarDays },
    { href: '/dashboard/pillars', label: () => m.dash_nav_pillars(), icon: Layers },  // NEW
    { href: '/dashboard/brand', label: () => m.dash_nav_campaigns(), icon: Megaphone },
    { href: '/dashboard/publishing', label: () => m.dash_nav_publishing(), icon: Send }
  ]
}
// Use Layers icon from lucide-svelte (or Columns3, LayoutGrid)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single `platform` text column on pillar | Junction table `pillar_platforms` | This phase | Enables many-to-many pillar-platform |
| Pillars only for personal_brand | Pillars for all product types | This phase | Universal content strategy |
| Drizzle ORM relations v1 | relations v2 with defineRelations() | drizzle-orm 0.39+ | We stay on v1 for consistency -- v2 migration not needed |
| Pillar editing only in onboarding | Onboarding + dedicated /dashboard/pillars page | This phase | Post-onboarding pillar management |

**Deprecated/outdated:**
- The single `platform` column approach: replaced by junction table
- The `{#if data.productType === 'personal_brand'}` guard on pillars: removed

## Open Questions

1. **Post count scaling with multi-platform pillars**
   - What we know: Current max is 12 posts per plan. With 5 pillars x 2 platforms = 10 minimum posts.
   - What's unclear: Should max increase beyond 12? Should each platform-pillar combo get 1 or 1-2 posts?
   - Recommendation: Set min = total pillar-platform combinations, max = min * 1.5 (capped at 20). Let the AI decide distribution within those bounds.

2. **Generate page pillar picker UX for multi-platform**
   - What we know: Current picker shows pillar name + single platform badge
   - What's unclear: How to display multiple platform badges per pillar in the compact picker popover
   - Recommendation: Stack platform badges horizontally next to each pillar name. The post estimate footer should calculate based on pillar-platform combinations, not just pillar count.

3. **Whether product/service types should show both pillars AND product details in onboarding**
   - What we know: Personal brands null out product detail fields. Product/service types currently only see product details.
   - What's unclear: Should product/service types see BOTH sections?
   - Recommendation: Yes. Product/service types get both the product details section AND the pillars section. This gives maximum flexibility. Only personal_brand nulls out product detail fields.

## Sources

### Primary (HIGH confidence)
- `/drizzle-team/drizzle-orm-docs` - Many-to-many junction table pattern with v1 relations(), migration generation
- Codebase analysis - schema.ts, brief-assembler.ts, plan-system.ts, copy-system.ts, post-generator.ts, deep-brief page, generate page, sidebar component, settings page, platform-specs.ts

### Secondary (MEDIUM confidence)
- Drizzle ORM v1 vs v2 relations migration guide - confirmed v1 pattern is still supported and used

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, all existing libraries
- Architecture: HIGH - junction table M2M is well-documented Drizzle pattern, codebase patterns thoroughly analyzed
- Pitfalls: HIGH - identified from direct codebase analysis of all touchpoints

**Research date:** 2026-03-02
**Valid until:** 2026-04-02 (stable domain, no fast-moving dependencies)
