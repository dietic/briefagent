# Phase 3: AI Generation Pipeline - Research

**Researched:** 2026-02-18
**Domain:** LLM structured output, AI image generation, background jobs in SvelteKit
**Confidence:** HIGH

## Summary

Phase 3 turns the user's onboarding data (product brief, brand assets, audience info) into a complete 2-week content plan with AI-generated copy and images. The pipeline has three distinct AI workloads: (1) content plan generation via LLM structured output (strategy + 8-12 post slots), (2) platform-optimized copy generation per post slot, and (3) brand-coherent image generation per post slot. Each workload uses a different model optimized for its task.

The Vercel AI SDK (`ai` package v6, `@ai-sdk/openai`, `@ai-sdk/fal`) is the standard abstraction layer. It provides `generateText` with `Output.object()` for structured JSON generation using Zod schemas, `generateImage` for image generation, and unified provider support across OpenAI and fal.ai. The AI SDK works directly with SvelteKit server endpoints -- no Vercel hosting required. The project already uses Zod (installed in Phase 2), so schema definitions are shared between validation and AI output.

For image generation, the landscape has shifted significantly since the May 2025 concern in STATE.md. DALL-E 2 and DALL-E 3 are deprecated (sunset May 12, 2026). OpenAI now offers `gpt-image-1` and `gpt-image-1.5` as replacements. Flux models (via fal.ai) remain a strong alternative at lower cost. The recommendation is to use OpenAI `gpt-image-1` as the primary image generator (best instruction following, brand coherence from detailed prompts) with fal.ai Flux as a fallback option, abstracted behind the AI SDK's provider-agnostic `generateImage` interface.

Background job orchestration uses a database-backed job status pattern with Server-Sent Events (SSE) for real-time progress updates to the client. SvelteKit's adapter-node supports long-running streaming responses. No external queue system (BullMQ, Redis) is needed for MVP -- the plan generation runs as a server-side async operation tracked by a `generation_jobs` database table, with SSE pushing status updates.

**Primary recommendation:** Use Vercel AI SDK v6 with `@ai-sdk/openai` for text generation (GPT-4.1 for plan strategy, GPT-4.1-mini for per-post copy) and `@ai-sdk/openai` for image generation (gpt-image-1). Use database-backed job status with SSE for progress tracking.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PLAN-01 | User can generate a 2-week content plan based on their full product brief | AI SDK `generateText` + `Output.object()` with Zod schema; brief assembly from existing DB tables (products, productBriefs, assets) |
| PLAN-02 | Content plan includes strategy overview, content themes, and individual post slots | Structured output schema defines strategy, themes, and post slot arrays with full type safety |
| PLAN-03 | Each post slot specifies date/time, platform, post type, topic/angle, content category, key message, and asset references | Zod schema enforces all required fields per slot; `pgEnum` for content categories |
| PLAN-04 | Content categories include educational, promotional, social proof, behind-the-scenes, engagement, tips, announcement, and storytelling | Enum constraint in both Zod schema (AI output) and Drizzle pgEnum (DB storage) |
| PLAN-05 | Promotional content never exceeds 30% of the plan | Prompt instruction + post-generation validation check; retry if violated |
| PLAN-06 | Plan generation considers summaries of previous plans to avoid repetition | Query previous plan summaries from DB, include in system prompt context |
| PLAN-07 | User sees progress indicator during plan generation (background job) | SSE streaming endpoint + `generation_jobs` DB table for status tracking |
| COPY-01 | AI generates platform-optimized copy for each post slot | GPT-4.1-mini with per-post prompt including slot context, brief data, brand voice |
| COPY-02 | Copy includes scroll-stopping hook, value-driven body, goal-aligned CTA | Structured prompt template with explicit sections; output schema validates presence |
| COPY-03 | LinkedIn copy is longer, professional but human, with up to 5 hashtags | Platform-specific prompt rules; Zod schema with `z.array(z.string()).max(5)` for hashtags |
| COPY-04 | Hashtags mix popular and niche tags relevant to user's industry | Prompt instruction specifying mix strategy; industry from productBriefs.industry |
| IMGN-01 | AI analyzes user's uploaded assets to understand brand visual identity | GPT-4.1-mini vision: analyze asset images for colors, style, typography, mood |
| IMGN-02 | AI generates original images informed by brand analysis | gpt-image-1 with detailed prompt including brand analysis results |
| IMGN-03 | Generated images are visually coherent with user's brand | Brand analysis output feeds into image prompt: color palette, style descriptors, mood |
| IMGN-04 | Images are optimized for LinkedIn post dimensions | Generate at 1200x1200 (1:1 square) or 1200x627 (1.91:1 landscape); Sharp for post-processing |
</phase_requirements>

## Standard Stack

### Core (Phase 3 additions)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | ^6.x | Vercel AI SDK core -- generateText, Output, generateImage | Provider-agnostic AI abstraction; Zod schema integration; streaming support; works with SvelteKit |
| `@ai-sdk/openai` | ^3.x | OpenAI provider for AI SDK | Supports GPT-4.1/4.1-mini text, gpt-image-1/1.5 images, vision; reads OPENAI_API_KEY env var |
| `@ai-sdk/fal` | ^1.x | fal.ai provider for AI SDK (optional) | Flux image generation as alternative/fallback; reads FAL_API_KEY env var |

### Already Installed (from Phase 2)

| Library | Purpose | Phase 3 Use |
|---------|---------|-------------|
| `zod` | Schema validation | AI structured output schemas, input validation |
| `drizzle-orm` | Database ORM | New tables for content plans, posts, generation jobs |
| `sharp` | Image processing | Resize generated images to LinkedIn dimensions |
| `date-fns` | Date manipulation | Schedule post dates across 2-week window |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel AI SDK | Direct OpenAI SDK (`openai` npm) | OpenAI SDK is fine for OpenAI-only, but AI SDK provides provider switching (OpenAI <-> fal.ai) and unified Zod schema integration |
| GPT-4.1 for plan gen | Claude for plan gen | Claude is excellent at structured reasoning but AI SDK's OpenAI integration is more battle-tested for structured output; GPT-4.1 has native JSON schema enforcement |
| gpt-image-1 for images | Flux 1.1 Pro via fal.ai | Flux is 50-75% cheaper ($0.04/img vs $0.07-0.19) but gpt-image-1 has better instruction following for brand-specific prompts; can swap later via AI SDK provider abstraction |
| SSE for progress | WebSocket | SSE is simpler (one-way server-to-client), built into SvelteKit, sufficient for job status updates |
| DB-backed job queue | BullMQ + Redis | BullMQ adds Redis dependency; for MVP with single-user generation, DB status tracking is sufficient |

**Installation:**
```bash
pnpm add ai @ai-sdk/openai
# Optional: pnpm add @ai-sdk/fal
```

## Architecture Patterns

### Project Structure (Phase 3 additions)

```
src/
  lib/
    server/
      ai/
        providers.ts         # AI SDK provider instances (openai, fal)
        prompts/
          plan-system.ts     # System prompt for content plan generation
          copy-system.ts     # System prompt for copy generation
          image-system.ts    # System prompt for image prompt construction
          brand-analysis.ts  # System prompt for brand asset analysis
        schemas/
          plan.ts            # Zod schemas for content plan output
          copy.ts            # Zod schemas for copy output
          brand-analysis.ts  # Zod schema for brand analysis output
        pipeline/
          plan-generator.ts  # Orchestrates plan generation
          copy-generator.ts  # Generates copy per post slot
          image-generator.ts # Generates images per post slot
          brand-analyzer.ts  # Analyzes uploaded assets for brand identity
          brief-assembler.ts # Assembles full brief from DB for prompt context
      db/
        schema.ts            # Extended with new tables (contentPlans, posts, generationJobs)
    types/
      ai.ts                  # Shared TypeScript types for AI pipeline
  routes/
    api/
      generate/
        plan/+server.ts      # POST: trigger plan generation, returns job ID
        posts/+server.ts     # POST: trigger copy+image generation for plan
      jobs/
        [id]/
          stream/+server.ts  # GET: SSE stream for job progress
          +server.ts         # GET: poll job status (fallback)
    dashboard/
      generate/+page.svelte  # UI for triggering generation + progress display
```

### Pattern 1: AI SDK Structured Output with Zod

**What:** Use `generateText` with `Output.object()` and Zod schemas to get typed, validated JSON from the LLM.

**When to use:** Content plan generation, copy generation, brand analysis -- any time the AI output needs a defined structure.

**Example:**
```typescript
// src/lib/server/ai/schemas/plan.ts
import { z } from 'zod';

export const contentCategoryEnum = z.enum([
  'educational', 'promotional', 'social_proof', 'behind_the_scenes',
  'engagement', 'tips', 'announcement', 'storytelling'
]);

export const postSlotSchema = z.object({
  dateTime: z.string().describe('ISO 8601 date-time for when to publish'),
  platform: z.literal('linkedin'),
  postType: z.enum(['static_image', 'text_only']),
  topic: z.string().describe('The specific angle or topic for this post'),
  contentCategory: contentCategoryEnum,
  keyMessage: z.string().describe('The core message this post should convey'),
  assetReferences: z.array(z.string()).describe('IDs of brand assets to reference, if applicable'),
});

export const contentPlanSchema = z.object({
  strategyOverview: z.string().describe('2-3 paragraph strategic overview explaining the content approach'),
  contentThemes: z.array(z.string()).min(3).max(5).describe('3-5 overarching themes for the content plan'),
  postSlots: z.array(postSlotSchema).min(8).max(12).describe('8-12 individual post slots for the 2-week period'),
});

export type ContentPlan = z.infer<typeof contentPlanSchema>;
export type PostSlot = z.infer<typeof postSlotSchema>;
```

```typescript
// src/lib/server/ai/pipeline/plan-generator.ts
import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { contentPlanSchema } from '../schemas/plan';
import { buildPlanSystemPrompt } from '../prompts/plan-system';
import type { AssembledBrief } from './brief-assembler';

export async function generateContentPlan(
  brief: AssembledBrief,
  previousPlanSummaries: string[]
): Promise<z.infer<typeof contentPlanSchema>> {
  const { output } = await generateText({
    model: openai('gpt-4.1'),
    output: Output.object({ schema: contentPlanSchema }),
    system: buildPlanSystemPrompt(),
    prompt: buildPlanUserPrompt(brief, previousPlanSummaries),
  });

  // Validate promotional content cap (30%)
  const promoCount = output.postSlots.filter(s => s.contentCategory === 'promotional').length;
  const promoPercent = promoCount / output.postSlots.length;
  if (promoPercent > 0.3) {
    // Re-generate with stricter instruction (or manually adjust)
    throw new Error('Promotional content exceeds 30% cap');
  }

  return output;
}
```

### Pattern 2: AI Image Generation with Brand Context

**What:** Generate brand-coherent images by first analyzing uploaded assets with vision, then using the analysis to construct detailed image prompts.

**When to use:** IMGN-01 through IMGN-04 requirements.

**Example:**
```typescript
// src/lib/server/ai/pipeline/brand-analyzer.ts
import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const brandAnalysisSchema = z.object({
  primaryColors: z.array(z.string()).describe('Hex color codes of dominant brand colors'),
  secondaryColors: z.array(z.string()).describe('Hex color codes of accent/secondary colors'),
  visualStyle: z.string().describe('Overall visual style: minimalist, bold, playful, corporate, etc.'),
  typography: z.string().describe('Typography style observed: serif, sans-serif, handwritten, etc.'),
  mood: z.string().describe('Emotional mood: professional, friendly, energetic, luxurious, etc.'),
  patterns: z.string().describe('Any recurring visual patterns, textures, or design elements'),
  imageStyleGuide: z.string().describe('Concise style guide for generating brand-coherent images'),
});

export type BrandAnalysis = z.infer<typeof brandAnalysisSchema>;

export async function analyzeBrandAssets(
  assetUrls: string[]
): Promise<BrandAnalysis> {
  const imageContent = assetUrls.slice(0, 5).map(url => ({
    type: 'image' as const,
    image: url,
  }));

  const { output } = await generateText({
    model: openai('gpt-4.1-mini'),
    output: Output.object({ schema: brandAnalysisSchema }),
    messages: [
      {
        role: 'system',
        content: 'You are a brand identity analyst. Analyze the provided brand assets and extract the visual identity characteristics.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze these brand assets and extract the visual identity:' },
          ...imageContent,
        ],
      },
    ],
  });

  return output;
}
```

```typescript
// src/lib/server/ai/pipeline/image-generator.ts
import { generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';
import sharp from 'sharp';
import type { BrandAnalysis } from './brand-analyzer';

export async function generatePostImage(
  postTopic: string,
  keyMessage: string,
  brandAnalysis: BrandAnalysis,
  dimensions: { width: number; height: number } = { width: 1200, height: 1200 }
): Promise<Buffer> {
  const prompt = buildImagePrompt(postTopic, keyMessage, brandAnalysis);

  const { image } = await generateImage({
    model: openai.image('gpt-image-1'),
    prompt,
    size: '1024x1024', // Generate at native resolution
    providerOptions: {
      openai: { quality: 'medium' },
    },
  });

  // Resize to target LinkedIn dimensions
  const buffer = Buffer.from(image.uint8Array);
  const resized = await sharp(buffer)
    .resize(dimensions.width, dimensions.height, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toBuffer();

  return resized;
}

function buildImagePrompt(topic: string, keyMessage: string, brand: BrandAnalysis): string {
  return `Create a professional social media image for LinkedIn.

Topic: ${topic}
Key Message: ${keyMessage}

Brand Style Guidelines:
- Primary colors: ${brand.primaryColors.join(', ')}
- Secondary colors: ${brand.secondaryColors.join(', ')}
- Visual style: ${brand.visualStyle}
- Mood: ${brand.mood}
- Design elements: ${brand.patterns}
- ${brand.imageStyleGuide}

Requirements:
- Professional, clean composition suitable for LinkedIn
- No text overlays (copy is separate)
- Brand-coherent color palette and visual style
- Eye-catching for social media feed scrolling`;
}
```

### Pattern 3: SSE Progress Streaming for Background Jobs

**What:** Track generation job status in the database, stream updates to the client via Server-Sent Events.

**When to use:** PLAN-07 -- user sees progress during plan generation.

**Example:**
```typescript
// src/routes/api/jobs/[id]/stream/+server.ts
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationJobs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals }) => {
  const user = await locals.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      const sendEvent = (data: Record<string, unknown>) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const poll = async () => {
        if (closed) return;
        const job = await db.query.generationJobs.findFirst({
          where: eq(generationJobs.id, params.id),
        });

        if (!job) {
          sendEvent({ status: 'not_found' });
          controller.close();
          return;
        }

        sendEvent({
          status: job.status,
          progress: job.progress,
          currentStep: job.currentStep,
          totalSteps: job.totalSteps,
          error: job.error,
        });

        if (job.status === 'completed' || job.status === 'failed') {
          closed = true;
          controller.close();
          return;
        }

        setTimeout(poll, 1000); // Poll DB every second
      };

      poll();

      return () => { closed = true; };
    },
  });

  return new Response(stream, { headers });
};
```

```typescript
// src/routes/api/generate/plan/+server.ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { generationJobs, contentPlans, posts } from '$lib/server/db/schema';
import { requireAuth } from '$lib/server/auth';
import { assembleBrief } from '$lib/server/ai/pipeline/brief-assembler';
import { generateContentPlan } from '$lib/server/ai/pipeline/plan-generator';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  const user = await requireAuth(event);
  const { productId } = await event.request.json();

  // Create job record
  const [job] = await db.insert(generationJobs).values({
    userId: user.id,
    productId,
    type: 'content_plan',
    status: 'pending',
    totalSteps: 3, // assemble brief, generate plan, save results
  }).returning();

  // Run generation in background (fire-and-forget)
  runPlanGeneration(job.id, user.id, productId).catch(console.error);

  return json({ jobId: job.id });
};

async function runPlanGeneration(jobId: string, userId: string, productId: string) {
  try {
    await updateJob(jobId, { status: 'running', currentStep: 1, progress: 'Assembling brief...' });
    const brief = await assembleBrief(productId);

    await updateJob(jobId, { currentStep: 2, progress: 'Generating content plan...' });
    const previousSummaries = await getPreviousPlanSummaries(productId);
    const plan = await generateContentPlan(brief, previousSummaries);

    await updateJob(jobId, { currentStep: 3, progress: 'Saving content plan...' });
    await savePlan(productId, plan);

    await updateJob(jobId, { status: 'completed', progress: 'Done!' });
  } catch (err) {
    await updateJob(jobId, {
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

async function updateJob(jobId: string, updates: Partial<typeof generationJobs.$inferInsert>) {
  await db.update(generationJobs).set(updates).where(eq(generationJobs.id, jobId));
}
```

### Pattern 4: Brief Assembly for AI Context

**What:** Gather all user data from products, productBriefs, and assets tables into a single context object for AI prompts.

**When to use:** Before any AI generation call.

**Example:**
```typescript
// src/lib/server/ai/pipeline/brief-assembler.ts
import { db } from '$lib/server/db';
import { products, productBriefs, assets } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export interface AssembledBrief {
  product: {
    name: string;
    description: string | null;
    websiteUrl: string | null;
    scrapedData: Record<string, unknown> | null;
  };
  brief: {
    problemSolved: string | null;
    keyFeatures: string[] | null;
    differentiator: string | null;
    pricingInfo: string | null;
    productStage: string | null;
    idealCustomer: string | null;
    industry: string | null;
    ageRange: string | null;
    painPoints: string[] | null;
    audienceHangouts: string[] | null;
    personalityTraits: string[] | null;
    exampleContent: string | null;
    wordsToUse: string[] | null;
    wordsToAvoid: string[] | null;
    mainGoal: string | null;
    postingFrequency: string | null;
  };
  assets: {
    id: string;
    fileUrl: string;
    tag: string | null;
    description: string | null;
    isPrimary: boolean | null;
  }[];
}

export async function assembleBrief(productId: string): Promise<AssembledBrief> {
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });
  if (!product) throw new Error('Product not found');

  const brief = await db.query.productBriefs.findFirst({
    where: eq(productBriefs.productId, productId),
  });

  const productAssets = await db.query.assets.findMany({
    where: eq(assets.productId, productId),
  });

  return {
    product: {
      name: product.name,
      description: product.description,
      websiteUrl: product.websiteUrl,
      scrapedData: product.scrapedData as Record<string, unknown> | null,
    },
    brief: brief ? {
      problemSolved: brief.problemSolved,
      keyFeatures: brief.keyFeatures,
      differentiator: brief.differentiator,
      pricingInfo: brief.pricingInfo,
      productStage: brief.productStage,
      idealCustomer: brief.idealCustomer,
      industry: brief.industry,
      ageRange: brief.ageRange,
      painPoints: brief.painPoints,
      audienceHangouts: brief.audienceHangouts,
      personalityTraits: brief.personalityTraits,
      exampleContent: brief.exampleContent,
      wordsToUse: brief.wordsToUse,
      wordsToAvoid: brief.wordsToAvoid,
      mainGoal: brief.mainGoal,
      postingFrequency: brief.postingFrequency,
    } : {} as AssembledBrief['brief'],
    assets: productAssets.map(a => ({
      id: a.id,
      fileUrl: a.fileUrl,
      tag: a.tag,
      description: a.description,
      isPrimary: a.isPrimary,
    })),
  };
}
```

### Anti-Patterns to Avoid

- **Do not call AI APIs from the client.** All LLM and image generation calls must happen in server endpoints (`+server.ts`). API keys must never reach the browser.
- **Do not generate all posts sequentially in one request.** Plan generation returns post slots; copy and image generation should run per-post, potentially in parallel batches, as a separate job.
- **Do not hard-code prompts inline.** Keep system prompts in dedicated files under `ai/prompts/`. This makes iteration easy and keeps server endpoint code clean.
- **Do not skip the 30% promotional cap validation.** The LLM may not perfectly follow this instruction. Always validate post-generation and retry or adjust if violated.
- **Do not store generated images as base64 in the database.** Upload to Supabase Storage and store the URL, just like user-uploaded assets.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| LLM structured JSON output | Custom JSON parsing, regex extraction | AI SDK `Output.object()` with Zod schema | Handles schema enforcement, validation, retries, provider differences |
| Image generation API calls | Direct fetch to OpenAI images endpoint | AI SDK `generateImage()` | Provider abstraction, error handling, size management, future provider switching |
| Provider switching logic | Custom if/else for OpenAI vs fal.ai | AI SDK provider pattern | Swap `openai.image()` for `fal.image()` with zero code changes to pipeline |
| Progress tracking | Custom WebSocket server | SSE via ReadableStream + DB polling | Native to SvelteKit, no extra dependencies, simpler than WebSockets |
| Date scheduling for 2-week plan | Manual date math | `date-fns` `addDays`, `setHours`, `eachDayOfInterval` | Timezone-aware, handles edge cases (weekends, holidays) |
| Image resizing for LinkedIn | Canvas API, manual ImageMagick | `sharp` (already installed) | Fast, well-tested, handles format conversion and quality optimization |
| Prompt template construction | String concatenation | Dedicated prompt builder functions | Testable, maintainable, easy to iterate on prompt engineering |

**Key insight:** The AI SDK is the critical abstraction that prevents vendor lock-in while providing type-safe, Zod-integrated AI operations. Every AI call in the pipeline should go through it.

## Common Pitfalls

### Pitfall 1: LLM Structured Output Non-Compliance

**What goes wrong:** Even with Zod schemas, the LLM may generate data that passes schema validation but violates business rules (e.g., >30% promotional content, duplicate themes, dates outside the 2-week window).
**Why it happens:** Schema validation catches structural issues, not semantic ones. The LLM follows the schema format but may not follow all prompt instructions.
**How to avoid:** Add post-generation business rule validation after every `generateText` call. Implement retry logic (max 2-3 retries) with stricter prompt wording if validation fails.
**Warning signs:** Accepting AI output without any post-validation checks.

### Pitfall 2: Image Generation Cost Explosion

**What goes wrong:** Generating images for 10+ posts at high quality racks up costs quickly. A single plan with 12 posts at "high" quality gpt-image-1 costs ~$2.28.
**Why it happens:** Default to "high" quality without considering the use case. LinkedIn post images do not need ultra-high-detail generation.
**How to avoid:** Use "medium" quality for gpt-image-1 (~$0.07/image, ~$0.84 for 12 posts). Use 1024x1024 native size and resize with Sharp. Consider generating images only when user approves a post (deferred generation) rather than upfront.
**Warning signs:** Using "high" quality by default; no cost tracking per user.

### Pitfall 3: Blocking the SvelteKit Event Loop

**What goes wrong:** AI generation (especially plan + 12 copies + 12 images) can take 2-5 minutes total. Running this synchronously in a request handler blocks other requests.
**Why it happens:** Treating AI generation like a normal API call that returns in <1s.
**How to avoid:** Fire-and-forget pattern: create a job record, return the job ID immediately, run generation as an async background operation. Client polls via SSE or GET. Never `await` the full pipeline in a request handler.
**Warning signs:** Long POST request that doesn't return until generation is complete; no job ID pattern.

### Pitfall 4: Brand Analysis on Every Image Generation

**What goes wrong:** Running GPT-4.1-mini vision analysis on all brand assets before every single image generation. This adds latency and cost.
**Why it happens:** Not caching the brand analysis result.
**How to avoid:** Run brand analysis once when the user first triggers generation (or when assets change). Cache the result in the database (`brand_analysis` column on products or a separate table). Invalidate when assets are added/removed.
**Warning signs:** Multiple vision API calls for the same set of assets within one generation job.

### Pitfall 5: DALL-E 3 Still in Code

**What goes wrong:** Using `dall-e-3` model identifier, which is deprecated and will be sunset on May 12, 2026.
**Why it happens:** Outdated documentation or tutorials still reference DALL-E 3.
**How to avoid:** Use `gpt-image-1` (or `gpt-image-1.5` for latest). The AI SDK supports both via `openai.image('gpt-image-1')`.
**Warning signs:** Any reference to `dall-e-3` or `dall-e-2` in code.

### Pitfall 6: SSE Connection Dropped Without Recovery

**What goes wrong:** The SSE stream closes due to network issues or browser timeout, and the client has no way to know the job status.
**Why it happens:** SSE connections can be interrupted by proxies, load balancers, or browser background tab throttling.
**How to avoid:** Implement a fallback GET endpoint (`/api/jobs/[id]`) for polling. On the client, if EventSource errors, fall back to polling every 2-3 seconds. Always store job status in the DB, not just in memory.
**Warning signs:** Job status only available via SSE stream; no REST fallback.

### Pitfall 7: Prompt Context Window Overflow

**What goes wrong:** The assembled brief (product info + all assets + previous plan summaries) exceeds the model's context window or becomes so large it degrades output quality.
**Why it happens:** Including full previous plans instead of summaries; including all asset descriptions verbatim.
**How to avoid:** Summarize previous plans before including them (store a `summary` field on content plans). Limit asset context to primary assets + their descriptions. GPT-4.1 has 1M token context, so this is mainly a quality concern, not a limit concern.
**Warning signs:** Including full text of previous plans; no summary mechanism.

## Code Examples

### Database Schema Extensions

```typescript
// Additions to src/lib/server/db/schema.ts
import { pgTable, uuid, text, timestamp, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const jobStatusEnum = pgEnum('job_status', [
  'pending', 'running', 'completed', 'failed'
]);

export const jobTypeEnum = pgEnum('job_type', [
  'content_plan', 'post_copy', 'post_image', 'post_full'
]);

export const contentCategoryEnum = pgEnum('content_category', [
  'educational', 'promotional', 'social_proof', 'behind_the_scenes',
  'engagement', 'tips', 'announcement', 'storytelling'
]);

export const postStatusEnum = pgEnum('post_status', [
  'draft', 'pending_review', 'approved', 'scheduled', 'published', 'failed'
]);

export const generationJobs = pgTable('generation_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  type: jobTypeEnum('type').notNull(),
  status: jobStatusEnum('status').default('pending').notNull(),
  progress: text('progress'),
  currentStep: integer('current_step').default(0),
  totalSteps: integer('total_steps').default(1),
  error: text('error'),
  resultId: uuid('result_id'), // ID of created content plan or post
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const contentPlans = pgTable('content_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  strategyOverview: text('strategy_overview').notNull(),
  contentThemes: text('content_themes').array().notNull(),
  summary: text('summary'), // Short summary for PLAN-06 context
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentPlanId: uuid('content_plan_id').references(() => contentPlans.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull().default('linkedin'),
  postType: text('post_type').notNull(), // 'static_image' | 'text_only'
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  topic: text('topic').notNull(),
  contentCategory: contentCategoryEnum('content_category').notNull(),
  keyMessage: text('key_message').notNull(),
  assetReferences: text('asset_references').array(),
  // Generated content
  copyText: text('copy_text'),
  hashtags: text('hashtags').array(),
  imageUrl: text('image_url'),
  imagePrompt: text('image_prompt'), // Store for debugging/regeneration
  // Status
  status: postStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

### AI Provider Configuration

```typescript
// src/lib/server/ai/providers.ts
import { openai } from '@ai-sdk/openai';

// Text models
export const planModel = openai('gpt-4.1');           // Higher quality for strategic planning
export const copyModel = openai('gpt-4.1-mini');      // Cost-effective for per-post copy
export const analysisModel = openai('gpt-4.1-mini');  // Vision-capable for brand analysis

// Image models
export const imageModel = openai.image('gpt-image-1');

// Model costs for tracking (approximate, per call)
export const MODEL_COSTS = {
  'gpt-4.1': { inputPerMillion: 2.0, outputPerMillion: 8.0 },
  'gpt-4.1-mini': { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  'gpt-image-1-medium': 0.07, // per image at medium quality, 1024x1024
};
```

### Copy Generation Per Post

```typescript
// src/lib/server/ai/pipeline/copy-generator.ts
import { generateText, Output } from 'ai';
import { copyModel } from '../providers';
import { z } from 'zod';
import type { AssembledBrief } from './brief-assembler';

const copyOutputSchema = z.object({
  hookLine: z.string().describe('Scroll-stopping first line that grabs attention'),
  body: z.string().describe('Value-driven body content, professional but human'),
  cta: z.string().describe('Goal-aligned call to action'),
  hashtags: z.array(z.string()).min(3).max(5).describe('Mix of popular and niche hashtags'),
  fullText: z.string().describe('Complete post text: hook + body + CTA + hashtags formatted for LinkedIn'),
});

export type CopyOutput = z.infer<typeof copyOutputSchema>;

export async function generatePostCopy(
  postSlot: { topic: string; contentCategory: string; keyMessage: string },
  brief: AssembledBrief
): Promise<CopyOutput> {
  const { output } = await generateText({
    model: copyModel,
    output: Output.object({ schema: copyOutputSchema }),
    system: buildCopySystemPrompt(brief),
    prompt: buildCopyUserPrompt(postSlot),
  });

  return output;
}

function buildCopySystemPrompt(brief: AssembledBrief): string {
  return `You are an expert LinkedIn content writer for ${brief.product.name}.

Product: ${brief.product.description}
Industry: ${brief.brief.industry || 'General'}
Target audience: ${brief.brief.idealCustomer || 'Professionals'}
Brand personality: ${brief.brief.personalityTraits?.join(', ') || 'Professional, friendly'}
Main goal: ${brief.brief.mainGoal || 'Brand awareness'}
${brief.brief.wordsToUse?.length ? `Words to use: ${brief.brief.wordsToUse.join(', ')}` : ''}
${brief.brief.wordsToAvoid?.length ? `Words to AVOID: ${brief.brief.wordsToAvoid.join(', ')}` : ''}

LinkedIn copy rules:
- First line MUST be a scroll-stopping hook (question, bold claim, surprising stat, or pattern interrupt)
- Body provides genuine value -- not just promotion
- Professional but human tone -- write like a real person, not a corporate brochure
- CTA should align with the main goal (${brief.brief.mainGoal})
- 3-5 hashtags: mix 2 popular industry hashtags with 2-3 niche ones
- Optimal length: 1200-1800 characters for LinkedIn engagement`;
}

function buildCopyUserPrompt(postSlot: { topic: string; contentCategory: string; keyMessage: string }): string {
  return `Write a LinkedIn post for:
Topic: ${postSlot.topic}
Category: ${postSlot.contentCategory}
Key message: ${postSlot.keyMessage}`;
}
```

### Client-Side Job Progress Component

```svelte
<!-- Example pattern for progress display -->
<script lang="ts">
  let jobId = $state<string | null>(null);
  let status = $state<string>('idle');
  let progress = $state<string>('');
  let currentStep = $state(0);
  let totalSteps = $state(0);

  function startGeneration(productId: string) {
    fetch('/api/generate/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
      .then(r => r.json())
      .then(data => {
        jobId = data.jobId;
        connectSSE(data.jobId);
      });
  }

  function connectSSE(id: string) {
    const source = new EventSource(`/api/jobs/${id}/stream`);

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      status = data.status;
      progress = data.progress || '';
      currentStep = data.currentStep || 0;
      totalSteps = data.totalSteps || 0;

      if (data.status === 'completed' || data.status === 'failed') {
        source.close();
      }
    };

    source.onerror = () => {
      source.close();
      // Fallback to polling
      pollJobStatus(id);
    };
  }

  function pollJobStatus(id: string) {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      status = data.status;
      progress = data.progress || '';
      if (data.status === 'completed' || data.status === 'failed') {
        clearInterval(interval);
      }
    }, 3000);
  }
</script>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| DALL-E 3 for image gen | gpt-image-1 / gpt-image-1.5 | 2025-2026 | DALL-E 2 and 3 deprecated (sunset May 12, 2026); gpt-image-1 has better quality and instruction following |
| AI SDK `generateObject()` | AI SDK `generateText()` + `Output.object()` | AI SDK v6 (2026) | `generateObject` is deprecated; new pattern unifies text and structured output |
| OpenAI Chat Completions API | OpenAI Responses API | 2025-2026 | AI SDK v5+ defaults to Responses API for OpenAI; Chat API still available via `.chat()` |
| Flux 1.0 | Flux 2 Pro | Late 2025 | Flux 2 Pro is zero-config, higher quality; available via fal.ai and Replicate |
| Manual JSON parsing from LLM | Zod schema enforcement via AI SDK | AI SDK v4+ | 100% reliable structured output with GPT-4.1; no more JSON parsing errors |
| Custom fetch to AI APIs | AI SDK provider abstraction | 2024+ | Swap providers (OpenAI, fal.ai, Anthropic) without changing pipeline code |

**Deprecated/outdated:**
- `dall-e-3` and `dall-e-2`: Sunset May 12, 2026. Use `gpt-image-1` or `gpt-image-1.5`.
- `generateObject()` / `streamObject()`: Deprecated in AI SDK v6. Use `generateText()` with `Output.object()`.
- OpenAI Assistants API: Deprecated August 2025, sunset August 2026. Use Responses API.

## Open Questions

1. **Image Generation Strategy: Eager vs. Lazy**
   - What we know: Generating images for all 12 posts upfront takes ~2 minutes and costs ~$0.84 at medium quality.
   - What's unclear: Should images generate immediately with the plan, or only when the user views/approves a post in Phase 4?
   - Recommendation: Generate images eagerly during plan generation (as part of the post generation job). Users expect to see complete posts. Lazy generation would create a fragmented experience where posts look incomplete. The cost is manageable at $0.84/plan.

2. **GPT-4.1 vs GPT-4.1-mini for Plan Generation**
   - What we know: GPT-4.1 ($2/$8 per M tokens) is 5x more expensive than GPT-4.1-mini ($0.40/$1.60 per M tokens). Plan generation is a ~3000 token output.
   - What's unclear: Whether GPT-4.1-mini produces sufficiently strategic content plans or if the quality difference justifies the cost.
   - Recommendation: Start with GPT-4.1 for plan generation (higher quality for strategic thinking, ~$0.03/plan) and GPT-4.1-mini for per-post copy (~$0.002/post). The plan generation cost is negligible even at full price. Switch to mini if quality is comparable.

3. **Brand Analysis Caching Granularity**
   - What we know: Brand analysis should be cached to avoid repeated vision API calls.
   - What's unclear: When to invalidate cache -- on any asset change, or only when primary assets change?
   - Recommendation: Store brand analysis JSON on the product record. Invalidate when any asset is added, removed, or has its primary status changed. This is simple and correct.

4. **Rate Limiting AI Generation**
   - What we know: A single plan generation involves 1 plan call + 12 copy calls + 12 image calls + 1 brand analysis = ~26 API calls.
   - What's unclear: OpenAI rate limits for the project's tier. Image generation may have lower rate limits than text.
   - Recommendation: Implement sequential execution with small delays (200ms) between image generation calls. Batch copy generation calls with `Promise.all` (5 at a time). Add rate limit error detection and exponential backoff.

## AI Model Selection Summary

| Task | Model | Approx Cost | Rationale |
|------|-------|-------------|-----------|
| Content plan generation | GPT-4.1 | ~$0.03/plan | Strategic thinking benefits from larger model; plan is single call |
| Per-post copy generation | GPT-4.1-mini | ~$0.002/post | Good quality for copywriting at 5x lower cost; 12 calls/plan |
| Brand asset analysis | GPT-4.1-mini (vision) | ~$0.01/analysis | Vision analysis is straightforward classification; cached per product |
| Image generation | gpt-image-1 (medium) | ~$0.07/image | Best instruction following for brand-specific images |
| **Total per plan** | **mixed** | **~$1.00** | **1 plan + 12 copies + 12 images + 1 brand analysis** |

## LinkedIn Image Dimensions

| Format | Dimensions | Aspect Ratio | Use Case |
|--------|-----------|--------------|----------|
| Square | 1200x1200 | 1:1 | Best for mobile-first; universal feed compatibility |
| Landscape | 1200x627 | 1.91:1 | Best for desktop; link previews; sponsored content |
| Portrait | 1080x1350 | 4:5 | Maximum mobile real estate; highest engagement |

**Recommendation:** Default to 1200x1200 (square). Generate at 1024x1024 native via gpt-image-1, then resize with Sharp to 1200x1200. Square format performs well on both mobile and desktop LinkedIn feeds.

## Sources

### Primary (HIGH confidence)
- [AI SDK Documentation - Getting Started with Svelte](https://ai-sdk.dev/docs/getting-started/svelte) - SvelteKit integration, server endpoint patterns
- [AI SDK Core - Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) - `Output.object()`, `Output.array()`, Zod schema integration, streaming
- [AI SDK Core - Image Generation](https://ai-sdk.dev/docs/ai-sdk-core/image-generation) - `generateImage`, provider support, size options, error handling
- [AI SDK Providers - OpenAI](https://ai-sdk.dev/providers/ai-sdk-providers/openai) - Model list (gpt-4.1, gpt-image-1, vision), provider options, installation
- [AI SDK Providers - Fal](https://ai-sdk.dev/providers/ai-sdk-providers/fal) - Flux model access, configuration, image generation
- [OpenAI API Pricing](https://openai.com/api/pricing/) - GPT-4.1 $2/$8 per M tokens; GPT-4.1-mini $0.40/$1.60; gpt-image-1 pricing tiers
- [OpenAI Image Generation Guide](https://platform.openai.com/docs/guides/image-generation) - gpt-image-1/1.5, sizes, quality options, DALL-E deprecation notice
- [OpenAI Models](https://platform.openai.com/docs/models) - DALL-E 2/3 sunset May 12, 2026; gpt-image-1.5 latest recommended

### Secondary (MEDIUM confidence)
- [SvelteKit SSE Pattern](https://sveltetalk.com/posts/building-real-time-sveltekit-apps-with-server-sent-events) - ReadableStream SSE implementation in SvelteKit endpoints
- [SvelteKit Background Workers Discussion](https://github.com/sveltejs/kit/discussions/12927) - Community patterns for long-running tasks in SvelteKit
- [LinkedIn Post Image Sizes 2026](https://www.socialpilot.co/blog/linkedin-post-sizes-guide) - 1200x1200 square, 1200x627 landscape, 1080x1350 portrait
- [AI Image Model Pricing Comparison](https://pricepertoken.com/image) - Cross-provider pricing for image generation models
- [fal.ai Flux Pricing](https://fal.ai/pricing) - Flux 1.1 Pro at $0.04/megapixel

### Tertiary (LOW confidence)
- [Complete Guide to AI Image Generation APIs 2026](https://wavespeed.ai/blog/posts/complete-guide-ai-image-apis-2026/) - Third-party comparison, may not be fully current
- GPT-4.1-mini pricing ($0.40/$1.60 per M tokens) from pricepertoken.com -- needs verification against official OpenAI pricing page

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - AI SDK v6 is well-documented with SvelteKit support; OpenAI provider verified
- Architecture: HIGH - Patterns follow AI SDK official docs and established SvelteKit conventions
- AI model selection: HIGH - Pricing and capabilities verified against official OpenAI docs and pricing pages
- Image generation: HIGH - gpt-image-1 verified; DALL-E deprecation confirmed; fal.ai Flux verified
- Background jobs: MEDIUM - SSE pattern is standard but SvelteKit doesn't have official background job support; DB-backed approach is pragmatic
- Pitfalls: HIGH - Based on AI SDK docs, OpenAI docs, and established patterns

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days - AI model landscape moves fast; pricing may change)
