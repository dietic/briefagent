# Phase 8: Platform Selection per Pillar - Research

**Researched:** 2026-02-20
**Domain:** Schema migration, platform-aware UI dropdowns, platform-specific AI prompt engineering
**Confidence:** HIGH

## Summary

Phase 8 adds an optional `platform` column to the `content_pillars` table and surfaces a per-pillar platform dropdown in the Deep Brief UI. The AI content generation pipeline (plan prompts, copy prompts, image generator) must branch on pillar platform to apply platform-specific specs (character limits, image dimensions, tone). This is a focused, well-scoped phase with no new libraries required -- it touches only existing patterns.

The codebase is currently hardcoded to LinkedIn everywhere: the plan system prompt says "LinkedIn content strategist," the copy prompt says "LinkedIn content writer," the Zod schema has `platform: z.literal('linkedin')`, the image generator resizes to 1200x1200 (LinkedIn square), and the copy prompt enforces LinkedIn-specific rules (1200-1800 chars, 3-5 hashtags). Phase 8 must make all of these conditional on the pillar's platform assignment while preserving LinkedIn as the default for pillars (or posts) without a platform.

**Primary recommendation:** Add a nullable `platform` text column to `content_pillars`, create a shared `PLATFORM_SPECS` config object keyed by platform slug, and inject platform context into all three prompt builders (plan, copy, image). The Deep Brief UI gets a dropdown per pillar card using the existing UI patterns already established in that page.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Drizzle ORM | existing | Schema update (add column) | Already used, `drizzle-kit push` for migration |
| Zod | existing | Update plan schema `platform` field | Already used in all AI schemas |
| AI SDK v6 | existing | No changes needed to AI SDK usage | Prompt content changes only |
| SvelteKit 2 / Svelte 5 | existing | Deep Brief UI dropdown | Already used |
| Paraglide i18n | existing | New i18n keys for platform names/labels | Already used |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sharp | existing | Platform-specific image resizing | Already used in image-generator.ts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain text column for platform | DB enum | Prior decision [06-01] chose plain text for productType to avoid migration complexity; same reasoning applies here |
| Per-pillar platform in separate table | Column on content_pillars | Column is simpler; 1-5 pillars per product makes a join table overkill |

**Installation:**
```bash
# No new packages needed. Only schema change + drizzle-kit push.
pnpm drizzle-kit push
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── server/
│       ├── ai/
│       │   ├── platform-specs.ts          # NEW: Platform config constants
│       │   ├── prompts/
│       │   │   ├── plan-system.ts         # MODIFY: Platform-aware plan prompts
│       │   │   ├── copy-system.ts         # MODIFY: Platform-aware copy prompts
│       │   │   └── image-system.ts        # MODIFY: Platform-aware image sizing
│       │   ├── pipeline/
│       │   │   ├── brief-assembler.ts     # MODIFY: Include pillar platform in assembled brief
│       │   │   ├── copy-generator.ts      # MODIFY: Pass platform to copy prompt
│       │   │   ├── image-generator.ts     # MODIFY: Platform-specific resize dimensions
│       │   │   └── post-generator.ts      # MODIFY: Pass platform through pipeline
│       │   └── schemas/
│       │       └── plan.ts                # MODIFY: platform field from literal to enum
│       └── db/
│           └── schema.ts                  # MODIFY: Add platform column to content_pillars
├── routes/
│   └── dashboard/
│       └── onboarding/
│           └── deep-brief/
│               ├── +page.server.ts        # MODIFY: Persist pillar platform
│               └── +page.svelte           # MODIFY: Add platform dropdown per pillar
└── messages/
    ├── en.json                            # MODIFY: Add ~10 i18n keys
    └── es.json                            # MODIFY: Add ~10 i18n keys
```

### Pattern 1: Platform Specs Config Object
**What:** A single shared config object that defines platform-specific constraints. Every part of the pipeline reads from this one source of truth.
**When to use:** Whenever you need platform-specific values (char limits, image sizes, tone, hashtag rules).
**Example:**
```typescript
// src/lib/server/ai/platform-specs.ts

export interface PlatformSpec {
  slug: string;
  displayName: string;
  charLimit: number;
  charRecommended: { min: number; max: number };
  imageSize: { width: number; height: number };
  imageAspectRatio: string;
  hashtagRules: string;
  toneGuidelines: string;
  engagementTimes: string;
  active: boolean;
}

export const PLATFORM_SPECS: Record<string, PlatformSpec> = {
  linkedin: {
    slug: 'linkedin',
    displayName: 'LinkedIn',
    charLimit: 3000,
    charRecommended: { min: 1200, max: 1800 },
    imageSize: { width: 1200, height: 1200 },
    imageAspectRatio: '1:1',
    hashtagRules: '3-5 hashtags: mix of 2 popular/broad + 2-3 niche/specific',
    toneGuidelines: 'Professional but human. No jargon. Conversational. Scannable with line breaks.',
    engagementTimes: '7-8am, 12pm, 5-6pm',
    active: true
  },
  x: {
    slug: 'x',
    displayName: 'X (Twitter)',
    charLimit: 280,
    charRecommended: { min: 200, max: 280 },
    imageSize: { width: 1200, height: 675 },
    imageAspectRatio: '16:9',
    hashtagRules: '1-2 hashtags maximum, integrated naturally into text',
    toneGuidelines: 'Concise, punchy, opinionated. Thread-friendly. Hot takes welcome.',
    engagementTimes: '8-10am, 12-1pm, 5-6pm',
    active: true
  },
  instagram: {
    slug: 'instagram',
    displayName: 'Instagram',
    charLimit: 2200,
    charRecommended: { min: 150, max: 500 },
    imageSize: { width: 1080, height: 1350 },
    imageAspectRatio: '4:5',
    hashtagRules: '5-15 hashtags, mix of popular and niche, placed at end or in first comment',
    toneGuidelines: 'Visual-first, casual, storytelling. Emojis welcome.',
    engagementTimes: '11am-1pm, 7-9pm',
    active: false
  },
  youtube: {
    slug: 'youtube',
    displayName: 'YouTube',
    charLimit: 5000,
    charRecommended: { min: 200, max: 500 },
    imageSize: { width: 1280, height: 720 },
    imageAspectRatio: '16:9',
    hashtagRules: '3-5 hashtags in description',
    toneGuidelines: 'Descriptive, SEO-aware. Hook in first 2 lines.',
    engagementTimes: '12-3pm, 5-7pm',
    active: false
  },
  tiktok: {
    slug: 'tiktok',
    displayName: 'TikTok',
    charLimit: 2200,
    charRecommended: { min: 50, max: 150 },
    imageSize: { width: 1080, height: 1920 },
    imageAspectRatio: '9:16',
    hashtagRules: '3-5 hashtags, trending + niche mix',
    toneGuidelines: 'Casual, trend-aware, authentic. Short and snappy.',
    engagementTimes: '7-9am, 12-3pm, 7-11pm',
    active: false
  }
};

export const ACTIVE_PLATFORMS = Object.values(PLATFORM_SPECS).filter(p => p.active);
export const COMING_SOON_PLATFORMS = Object.values(PLATFORM_SPECS).filter(p => !p.active);

export function getPlatformSpec(slug: string | null): PlatformSpec {
  if (!slug || !PLATFORM_SPECS[slug]) return PLATFORM_SPECS.linkedin; // default
  return PLATFORM_SPECS[slug];
}
```

### Pattern 2: Platform Dropdown Per Pillar Card
**What:** A `<select>` dropdown inside each pillar card in the Deep Brief UI. Uses the existing card layout pattern already in the page.
**When to use:** In the Deep Brief page, within each content pillar card.
**Example:**
```svelte
<!-- Inside each pillar card, after the description textarea -->
<div class="space-y-1">
  <label class="block text-[0.75rem] font-semibold" style="color: var(--text-dim);">
    {m.onb_brief_pillar_platform()}
  </label>
  <div class="relative">
    <select
      bind:value={pillar.platform}
      class="w-full px-3 py-2.5 rounded-lg text-[0.85rem] outline-none appearance-none transition-all duration-200 cursor-pointer"
      style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-main);"
    >
      <option value="">{m.onb_brief_pillar_platform_none()}</option>
      {#each activePlatforms as p}
        <option value={p.slug}>{p.displayName}</option>
      {/each}
      {#each comingSoonPlatforms as p}
        <option value={p.slug} disabled>{p.displayName} — {m.onb_brief_pillar_platform_coming_soon()}</option>
      {/each}
    </select>
    <ChevronDown class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style="color: var(--text-muted);" />
  </div>
</div>
```

### Pattern 3: Platform-Aware Prompt Injection
**What:** Inject platform-specific rules into the system and user prompts based on pillar platform.
**When to use:** In plan-system.ts, copy-system.ts, and image-system.ts.
**Key insight:** The plan prompt already distributes posts across pillars. With platform per pillar, each pillar's posts inherit that pillar's platform. The plan schema needs `platform` changed from `z.literal('linkedin')` to `z.enum(['linkedin', 'x'])` (active platforms only). The AI must be told which pillar maps to which platform so it assigns the correct platform to each post slot.
**Example approach for plan prompt:**
```typescript
// In buildPlanUserPrompt, when pillars exist:
const pillarLines = brief.contentPillars.map(
  (p, i) => {
    const platformLabel = p.platform
      ? `[Platform: ${getPlatformSpec(p.platform).displayName}]`
      : '[Platform: LinkedIn (default)]';
    return `${i + 1}. **${p.name}**${p.description ? `: ${p.description}` : ''} ${platformLabel}`;
  }
);
// Add instruction:
// "Each post's platform field MUST match its assigned pillar's platform."
```

### Pattern 4: Conditional Image Resizing
**What:** The image generator currently hardcodes `sharp(buffer).resize(1200, 1200)`. It must read the platform spec and resize accordingly.
**When to use:** In `image-generator.ts`.
**Example:**
```typescript
const spec = getPlatformSpec(platform);
const resized = await sharp(buffer)
  .resize(spec.imageSize.width, spec.imageSize.height, { fit: 'cover' })
  .jpeg({ quality: 90 })
  .toBuffer();
```

### Anti-Patterns to Avoid
- **Hardcoding platform rules in prompts:** Don't scatter "LinkedIn rules" and "X rules" across prompt files. Use the shared `PLATFORM_SPECS` config and inject dynamically.
- **Changing DB enums:** Prior decision [06-01] says to use plain text columns, not DB enums, for small sets of values. Don't create a `pgEnum` for platform.
- **Requiring platform selection:** The user decision says platform is optional. Never make the dropdown required or block form submission without one.
- **Separate save endpoint for platform:** The Deep Brief already uses a delete-all-then-insert pattern for pillars [07-01]. Just include `platform` in the same insert. No new API endpoint needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Platform specs lookup | Scattered if/else blocks for each platform | Shared `PLATFORM_SPECS` config object | Single source of truth, easy to extend with new platforms |
| "Coming soon" badge logic | Custom disabled logic per component | `PlatformSpec.active` boolean flag | Clean separation, future platforms just set `active: true` |
| Platform-specific image sizing | Hardcoded dimensions in if/else | `getPlatformSpec(platform).imageSize` | Consistent, extensible |

**Key insight:** This phase is about config-driven platform awareness, not new infrastructure. Every platform-specific behavior should read from one config object, not be scattered across files.

## Common Pitfalls

### Pitfall 1: Forgetting to Update the Zod Schema
**What goes wrong:** The plan schema has `platform: z.literal('linkedin')`. If not changed, AI SDK structured output will reject any post with `platform: 'x'`.
**Why it happens:** The schema file is separate from the prompt files and easy to overlook.
**How to avoid:** Change `z.literal('linkedin')` to `z.enum(['linkedin', 'x'])` in `src/lib/server/ai/schemas/plan.ts`. Keep only active platforms in the enum.
**Warning signs:** AI generation errors like "Invalid enum value" in the plan generation step.

### Pitfall 2: Copy Prompt Character Limit Mismatch
**What goes wrong:** The copy prompt currently says "1200-1800 characters" which is LinkedIn-specific. If generating for X (280 char limit), the AI will produce far too long copy.
**Why it happens:** Copy prompt rules are currently hardcoded for LinkedIn.
**How to avoid:** Inject platform-specific char limits and rules from `PLATFORM_SPECS` into the copy system prompt. The `buildCopySystemPrompt` function already takes `brief` -- extend it to also take `platform`.
**Warning signs:** X posts that are 1500+ characters, obviously wrong.

### Pitfall 3: Pillar-to-Post Platform Propagation
**What goes wrong:** The plan assigns posts to pillars, but the `posts.platform` column isn't correctly set from the pillar's platform during plan generation save.
**Why it happens:** Currently `platform: slot.platform` comes from the AI's output. The AI must know which pillar has which platform to output the correct value.
**How to avoid:** Two approaches: (a) Tell the AI in the prompt and trust it, or (b) post-process the AI output and override `slot.platform` based on pillar assignment. Approach (a) is simpler and works well with structured output. Approach (b) is safer. Recommend (a) with validation.
**Warning signs:** All posts showing "linkedin" even for pillars assigned to X.

### Pitfall 4: Image Generation for Text-Heavy Platforms
**What goes wrong:** X posts are primarily text (280 chars). Generating images for every X post wastes API credits.
**Why it happens:** The current pipeline generates images for all `static_image` posts regardless of platform.
**How to avoid:** Consider whether X posts should default to `text_only` postType. This can be handled in the plan system prompt: "For X/Twitter posts, prefer text_only post type unless the topic strongly benefits from a visual."
**Warning signs:** Excessive image generation costs for short-form platforms.

### Pitfall 5: Coming Soon Platforms Saved to DB
**What goes wrong:** A user selects a "coming soon" platform option (e.g., Instagram) via browser dev tools or API manipulation, and the value gets saved.
**Why it happens:** Server-side doesn't validate platform against active platforms list.
**How to avoid:** On save, validate that if a platform is provided, it must be in the active platforms list. Otherwise, set it to null.
**Warning signs:** Platform values in DB that have no corresponding active generation logic.

## Code Examples

### Schema Change (content_pillars table)
```typescript
// src/lib/server/db/schema.ts - contentPillars table
export const contentPillars = pgTable('content_pillars', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  platform: text('platform'),  // NEW: nullable, 'linkedin' | 'x' | null
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});
```

### Brief Assembler Update
```typescript
// src/lib/server/ai/pipeline/brief-assembler.ts - add platform to contentPillars shape
contentPillars: Array<{
  name: string;
  description: string | null;
  platform: string | null;  // NEW
  sortOrder: number;
}>;

// In assembleBrief():
contentPillars: pillars.map((p) => ({
  name: p.name,
  description: p.description,
  platform: p.platform,  // NEW
  sortOrder: p.sortOrder
}))
```

### Plan Schema Update
```typescript
// src/lib/server/ai/schemas/plan.ts
export const postSlotSchema = z.object({
  // ... existing fields
  platform: z.enum(['linkedin', 'x']),  // CHANGED from z.literal('linkedin')
  // ...
});
```

### Copy Prompt Platform Awareness
```typescript
// src/lib/server/ai/prompts/copy-system.ts
import { getPlatformSpec, type PlatformSpec } from '../platform-specs';

export function buildCopySystemPrompt(brief: AssembledBrief, platform: string | null): string {
  const spec = getPlatformSpec(platform);
  const { product, brief: b } = brief;
  // ... existing product/brand setup ...

  return `You are an expert ${spec.displayName} content writer for ${product.name}.
// ... existing product info ...

${spec.displayName} Copy Rules:
1. Scroll-stopping hook as the FIRST line
2. ${spec.toneGuidelines}
3. ${spec.hashtagRules}
4. Optimal post length: ${spec.charRecommended.min}-${spec.charRecommended.max} characters (hard limit: ${spec.charLimit})
5. CTA aligned with the main goal (${b.mainGoal ?? 'brand awareness'})
${spec.slug === 'linkedin' ? '6. Use line breaks for readability -- LinkedIn rewards scannable content\n7. Never use emojis excessively -- 0-2 max if they add meaning' : ''}
${spec.slug === 'x' ? '6. Be concise -- every word must earn its place\n7. Consider thread format for complex topics' : ''}`;
}
```

### Deep Brief Server Action Update
```typescript
// src/routes/dashboard/onboarding/deep-brief/+page.server.ts
// Inside the pillar save block:
if (isPersonalBrand) {
  const pillarsRaw = formData.get('pillars') as string;
  let pillarItems: Array<{ name: string; description: string; platform: string }> = [];
  try {
    pillarItems = JSON.parse(pillarsRaw || '[]');
  } catch {
    pillarItems = [];
  }

  const activeSlugs = new Set(['linkedin', 'x']); // or import from platform-specs

  await db.delete(contentPillars).where(eq(contentPillars.productId, product.id));
  if (pillarItems.length > 0) {
    await db.insert(contentPillars).values(
      pillarItems.map((p, i) => ({
        productId: product.id,
        name: p.name,
        description: p.description || null,
        platform: (p.platform && activeSlugs.has(p.platform)) ? p.platform : null,
        sortOrder: i
      }))
    );
  }
}
```

### Image Generator Platform-Aware Resize
```typescript
// src/lib/server/ai/pipeline/image-generator.ts
import { getPlatformSpec } from '../platform-specs';

export async function generatePostImage(
  postTopic: string,
  keyMessage: string,
  brandAnalysis: BrandAnalysis,
  productId: string,
  postId: string,
  platform: string | null  // NEW parameter
): Promise<{ imageUrl: string; imagePrompt: string }> {
  const spec = getPlatformSpec(platform);
  // ... generate image ...
  const resized = await sharp(buffer)
    .resize(spec.imageSize.width, spec.imageSize.height, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toBuffer();
  // ... upload ...
}
```

## Platform Specs Reference (Verified)

| Platform | Char Limit | Recommended Length | Image Size | Aspect Ratio | Active |
|----------|-----------|-------------------|------------|--------------|--------|
| LinkedIn | 3,000 | 1,200-1,800 | 1200x1200 | 1:1 | Yes |
| X (Twitter) | 280 | 200-280 | 1200x675 | 16:9 | Yes |
| Instagram | 2,200 | 150-500 | 1080x1350 | 4:5 | Coming soon |
| YouTube | 5,000 | 200-500 | 1280x720 | 16:9 | Coming soon |
| TikTok | 2,200 | 50-150 | 1080x1920 | 9:16 | Coming soon |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `platform: z.literal('linkedin')` | Must change to `z.enum(['linkedin', 'x'])` | Phase 8 | Allows multi-platform plan generation |
| Hardcoded LinkedIn rules in prompts | Config-driven platform specs injected into prompts | Phase 8 | All platform rules in one file |
| Fixed 1200x1200 image resize | Platform-specific resize dimensions | Phase 8 | Correct image ratios per platform |

**Deprecated/outdated:**
- Twitter character limit was 140 before 2017, now 280 on X. All current sources confirm 280.

## Open Questions

1. **Should non-personal-brand product types also get platform selection?**
   - What we know: Content pillars are currently only for `personal_brand` product type. The success criteria says "Deep Brief UI shows platform dropdown per pillar for all product types that have pillars."
   - What's unclear: Product/service types don't have pillars. Should they get a single global platform picker instead?
   - Recommendation: For Phase 8, only add platform dropdown to pillars (personal_brand only). A global product-level platform picker could come in a future phase. This matches "all product types that have pillars" literally -- only personal_brand has pillars.

2. **Post-level platform override in the review/edit UI?**
   - What we know: Posts inherit platform from their pillar assignment during plan generation.
   - What's unclear: Should users be able to change a single post's platform in the review UI?
   - Recommendation: Defer to a future phase. For Phase 8, platform flows pillar -> post during generation only.

3. **Copy prompt for posts without a pillar (product/service types)?**
   - What we know: Products/services don't have pillars, so posts have no pillar platform.
   - What's unclear: These posts currently default to LinkedIn. Should Phase 8 change anything for them?
   - Recommendation: No change. Posts without pillars continue to default to LinkedIn, matching the existing behavior and "no platform = generic content" requirement (where "generic" = LinkedIn default).

4. **Thread support for X posts?**
   - What we know: X has 280 char limit. Complex topics may need threads.
   - What's unclear: Whether the copy schema should support multi-tweet threads.
   - Recommendation: Defer thread support. Phase 8 generates single-tweet posts for X. This keeps the copy schema unchanged (`fullText` stays as single string).

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/lib/server/db/schema.ts` (contentPillars table structure)
- Codebase analysis: `src/lib/server/ai/schemas/plan.ts` (current Zod schema with `z.literal('linkedin')`)
- Codebase analysis: `src/lib/server/ai/prompts/copy-system.ts` (hardcoded LinkedIn rules)
- Codebase analysis: `src/lib/server/ai/prompts/plan-system.ts` (hardcoded LinkedIn strategist)
- Codebase analysis: `src/lib/server/ai/pipeline/image-generator.ts` (hardcoded 1200x1200 resize)
- Codebase analysis: `src/lib/server/ai/pipeline/brief-assembler.ts` (contentPillars shape)
- Codebase analysis: `src/routes/dashboard/onboarding/deep-brief/+page.svelte` (pillar card UI)
- Codebase analysis: `src/routes/dashboard/onboarding/deep-brief/+page.server.ts` (pillar save logic)
- Codebase analysis: `src/routes/api/generate/plan/+server.ts` (plan save with `slot.platform`)

### Secondary (MEDIUM confidence)
- LinkedIn specs: 3,000 char limit, 1200x1200 (1:1) or 1200x627 (1.91:1) images -- verified via multiple 2026 sources (postiv.ai, socialrails.com, sendible.com)
- X/Twitter specs: 280 char limit, 1200x675 (16:9) images -- verified via multiple 2026 sources (postfa.st, viraly.io, heyorca.com)
- Instagram specs: 2,200 char limit, 1080x1350 (4:5) images -- verified via buffer.com, sendible.com
- Drizzle ORM migration: `drizzle-kit push` for adding columns -- verified via orm.drizzle.team/docs/migrations

### Tertiary (LOW confidence)
- YouTube/TikTok specs: Included for "coming soon" config completeness but not critical for Phase 8 implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed, all existing patterns
- Architecture: HIGH - Clear modification points in every affected file identified and verified against codebase
- Pitfalls: HIGH - All pitfalls derived from actual code analysis (hardcoded literals, schema constraints, save patterns)
- Platform specs: MEDIUM - Verified against multiple recent sources but platform policies can change

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (30 days -- stable domain, platform specs rarely change)
