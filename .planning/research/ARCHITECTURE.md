# Architecture Patterns

**Domain:** AI-powered social media marketing automation platform
**Project:** BriefAgent.ai
**Researched:** 2026-02-15
**Overall confidence:** MEDIUM (based on training data patterns; WebSearch unavailable for latest ecosystem verification)

---

## Recommended Architecture

### High-Level System Overview

BriefAgent is a **monolith-first web application** with an **asynchronous job processing layer** for AI generation and a **scheduler service** for reliable publishing. This is NOT a microservices architecture -- it is a well-structured monolith with clear module boundaries and a separate worker process for background jobs.

```
                                    +------------------+
                                    |   Landing Page   |
                                    |   (Marketing)    |
                                    +--------+---------+
                                             |
+--------------------------------------------v-------------------------------------------+
|                              APPLICATION LAYER                                          |
|                                                                                         |
|  +----------------+  +------------------+  +----------------+  +--------------------+   |
|  |   Auth Module  |  | Onboarding Module|  | Calendar Module|  |  Publishing Module |   |
|  | - Registration |  | - Quick Start    |  | - Month/Week   |  | - LinkedIn OAuth   |   |
|  | - Email verify |  | - Deep Brief     |  | - Post review  |  | - Token management |   |
|  | - Sessions     |  | - Asset Library  |  | - Status mgmt  |  | - API calls        |   |
|  +----------------+  | - URL scraping   |  | - Scheduling   |  | - Error handling   |   |
|                       +------------------+  +----------------+  +--------------------+   |
|                                                                                         |
|  +------------------+  +--------------------+  +------------------+                     |
|  |  Product Module  |  |  AI Generation     |  |  Asset Module    |                     |
|  | - CRUD products  |  |  Module (API layer)|  | - Upload/store   |                     |
|  | - Brief data     |  | - Plan generation  |  | - Tagging        |                     |
|  | - Brand config   |  | - Copy generation  |  | - AI analysis    |                     |
|  +------------------+  | - Image generation |  | - CDN serving    |                     |
|                         | - Job dispatching  |  +------------------+                     |
|                         +--------------------+                                           |
|                                                                                         |
+-----+---------------------------+-------------------------------------------------------+
      |                           |
      | REST/tRPC API             | Job Queue (enqueue)
      |                           |
+-----v---------+        +-------v-------------------------------------------+
|   Frontend    |        |            BACKGROUND WORKER LAYER                 |
|   (Next.js    |        |                                                    |
|    App Router)|        |  +------------------+  +------------------------+  |
|               |        |  | Plan Generation  |  | Post Generation        |  |
| - Dashboard   |        |  | Worker           |  | Worker                 |  |
| - Calendar    |        |  | - Assembles ctx  |  | - Copy sub-job (LLM)  |  |
| - Onboarding  |        |  | - LLM call       |  | - Image sub-job (gen) |  |
| - Post review |        |  | - Parses plan    |  | - Combines results    |  |
| - Settings    |        |  | - Creates posts  |  | - Updates post record  |  |
| - Asset mgmt  |        |  +------------------+  +------------------------+  |
+---------------+        |                                                    |
                          |  +------------------+  +------------------------+  |
                          |  | Asset Analysis   |  | URL Scraping           |  |
                          |  | Worker           |  | Worker                 |  |
                          |  | - Vision model   |  | - Fetch & parse        |  |
                          |  | - Extract style  |  | - Extract metadata     |  |
                          |  | - Store analysis |  | - Store results        |  |
                          |  +------------------+  +------------------------+  |
                          |                                                    |
                          +----------------------------------------------------+
                                              |
                          +-------------------v-------------------+
                          |        SCHEDULER SERVICE              |
                          |  - Polls every 60s for due posts      |
                          |  - Publishes via platform APIs        |
                          |  - Retry logic (3 attempts)           |
                          |  - Updates post status                |
                          +---------------------------------------+
                                              |
                          +-------------------v-------------------+
                          |        EXTERNAL SERVICES              |
                          |  - LinkedIn API                       |
                          |  - OpenAI / Anthropic (LLM)           |
                          |  - Image generation API               |
                          |  - Object storage (S3/R2)             |
                          |  - Email service (Resend)             |
                          +---------------------------------------+
```

### Why Monolith-First

1. **Single team, single codebase.** Microservices add deployment complexity, distributed tracing, service mesh -- none of which a solo/small team needs.
2. **Shared data model.** Products, briefs, posts, assets are deeply interrelated. Splitting them across services creates unnecessary network boundaries.
3. **The "separate worker" is not a microservice.** It shares the same codebase and database; it just runs in a different process. This is a deployment topology choice, not an architectural one.
4. **Easy to extract later.** If the scheduler or AI pipeline needs to scale independently (unlikely before 10K users), it can be extracted then with clear boundaries already in place.

---

## Component Boundaries

| Component | Responsibility | Communicates With | Boundary Type |
|-----------|---------------|-------------------|---------------|
| **Web Application** | HTTP handling, API routes, SSR, authentication, session management | Database, Job Queue, Object Storage | Process boundary (web server) |
| **Background Workers** | Execute long-running AI generation tasks, URL scraping, asset analysis | Database, LLM APIs, Image Gen APIs, Object Storage | Process boundary (worker process) |
| **Scheduler** | Poll for due posts, execute publishing, handle retries | Database, LinkedIn API | Process boundary (cron worker or dedicated loop) |
| **Database** | Persistent storage for all domain data | All components connect | PostgreSQL |
| **Job Queue** | Reliable task dispatch and execution tracking | Web app enqueues, Workers dequeue | In-database (pgboss) or Redis-backed |
| **Object Storage** | File storage for uploads and generated images | Web app (upload), Workers (write generated), Frontend (read/display) | External service (S3/R2) |
| **Cache Layer** | Session storage, rate limiting, real-time job progress | Web app, Workers | Redis (if needed) or in-memory |

### Communication Patterns

- **Web App to Workers:** Asynchronous via job queue. Never synchronous RPC.
- **Workers to Web App:** Never directly. Workers update the database; the web app reads updated state. For real-time progress, workers update a progress record that the frontend polls or subscribes to via SSE.
- **Web App to Frontend:** REST API (or tRPC for type safety). Server-rendered pages where possible.
- **Scheduler to LinkedIn API:** Direct HTTP calls with retry logic. No queue needed here -- the scheduler IS the consumer.

---

## Data Flow Diagrams

### Flow 1: Onboarding (Quick Start)

```
User fills form
    |
    v
[Save Product record] --> DB: products table
    |
    v
[Upload logo] --> Object Storage (S3/R2)
    |             |
    |             v
    |         DB: assets table (logo reference)
    |
    v
[Submit website URL] --> Enqueue "scrape-url" job
    |
    v
[Worker picks up job]
    |
    v
[Fetch URL, parse HTML]
    |
    v
[Extract: description, colors, meta tags, OG images]
    |
    v
[Store scraped data] --> DB: products.scraped_data (JSONB)
    |
    v
[Update product with extracted info]
    |
    v
[Frontend polls/receives update, shows extracted data]
    |
    v
[User reviews, corrects, continues to Deep Brief]
```

### Flow 2: Content Plan Generation (Critical Path)

```
User clicks "Generate Content Plan"
    |
    v
[API validates: product has brief, at least 1 connected account]
    |
    v
[Create content_plans record: status = "generating"]
    |
    v
[Enqueue "generate-plan" job with plan_id]
    |
    v
[Return immediately: { planId, status: "generating" }]
    |
    v
[Frontend shows progress UI, polls GET /api/plans/:id/status]
    |
    |--- Meanwhile, in the worker: ---
    |
    v
[Worker picks up "generate-plan" job]
    |
    v
[Assemble context payload:]
    |   - Product brief (name, description, features, differentiator, audience)
    |   - Brand voice configuration (traits, example content, words to use/avoid)
    |   - All assets with their tags, descriptions, and AI analysis results
    |   - Connected platforms and their constraints
    |   - Posting frequency preference
    |   - Current date range (2 weeks from now)
    |   - Summaries of previous plans (to avoid repetition)
    |
    v
[Update plan: progress = "assembling_context"]
    |
    v
[Build system prompt + user prompt for plan generation]
    |
    v
[Call LLM (Claude/GPT-4) with structured output (JSON mode)]
    |   - System prompt: "You are a social media strategist..."
    |   - Include all context
    |   - Request: strategy overview, themes, and N post slots
    |   - Constraint: max 30% promotional content
    |
    v
[Update plan: progress = "generating_strategy"]
    |
    v
[Receive LLM response, parse JSON]
    |
    v
[Validate structure: correct number of slots, valid dates, etc.]
    |
    v
[Create post records for each slot:]
    |   Each post gets:
    |   - scheduled_at (from plan)
    |   - platform (from plan)
    |   - topic, angle, content_category
    |   - suggested_assets (references)
    |   - hook, key_message
    |   - status = "draft"
    |   - copy = null (not yet generated)
    |   - image_url = null (not yet generated)
    |
    v
[Update plan: status = "complete", progress = null]
    |
    v
[Frontend detects completion, refreshes calendar view]
    |
    v
[Individual post generation can now be triggered -- see Flow 3]
```

### Flow 3: Individual Post Generation (Copy + Image)

```
User clicks "Generate" on a post slot (or batch: "Generate All")
    |
    v
[API updates post: status = "generating"]
    |
    v
[Enqueue "generate-post" job with post_id]
    |
    v
[Return immediately]
    |
    |--- Worker picks up job ---
    |
    v
[Load post slot data + full product context + brand assets]
    |
    v
+------ Run copy and image generation in parallel ------+
|                                                         |
|  COPY GENERATION                IMAGE GENERATION        |
|  ================              ===================      |
|                                                         |
|  [Build copy prompt:]         [Load brand analysis:]    |
|  - Platform constraints       - Color palette           |
|  - Post topic/angle           - Visual style notes      |
|  - Content category           - Aesthetic descriptors   |
|  - Brand voice config         - Logo style              |
|  - Hook/key message                                     |
|  - CTA goals                  [Build image prompt:]     |
|  - Hashtag strategy           - Post topic/angle        |
|                               - Visual style from       |
|  [Call LLM]                     brand analysis          |
|  - Structured output          - Platform dimensions     |
|  - Extract: hook, body,       - Content category        |
|    CTA, hashtags                visual style hints      |
|                                                         |
|  [Validate copy:]            [Call image gen API:]      |
|  - Character limits           - DALL-E 3 / Flux /       |
|  - Hashtag count                Ideogram                |
|  - Contains required          - Style parameters        |
|    elements                   - Dimensions per          |
|                                 platform                |
|  [Store copy fields           - Quality: high           |
|   on post record]                                       |
|                               [Upload generated image   |
|                                to Object Storage]       |
|                                                         |
|                               [Store image_url on       |
|                                post record]             |
|                                                         |
+------ Both complete: update post status ---------------+
    |
    v
[Post status = "pending_review"]
    |
    v
[Frontend shows generated post with preview]
```

### Flow 4: Publishing (Scheduler)

```
[Scheduler runs every 60 seconds]
    |
    v
[Query: SELECT * FROM posts
    WHERE status = 'scheduled'
    AND scheduled_at <= NOW()
    AND retry_count < 3
    ORDER BY scheduled_at ASC
    LIMIT 10
    FOR UPDATE SKIP LOCKED]    <-- prevents double-processing
    |
    v
[For each post:]
    |
    v
[Load associated platform account + OAuth tokens]
    |
    v
[Check token expiry, refresh if needed]
    |
    v
[Build platform API payload:]
    |   LinkedIn: { text, image_urn (if image) }
    |
    v
[If image: upload image to LinkedIn media API first]
    |   1. Register upload
    |   2. Upload binary
    |   3. Get image URN
    |
    v
[Create post via LinkedIn API]
    |
    +--- Success ---+
    |               |
    |         [Update post:]
    |         - status = "published"
    |         - published_at = NOW()
    |         - platform_post_id = response.id
    |         - platform_post_url = constructed URL
    |
    +--- Failure ---+
                    |
              [Increment retry_count]
              [Store error message]
              [If retry_count >= 3:]
              |   - status = "failed"
              |   - Surface error in dashboard
              [Else:]
              |   - Keep status = "scheduled"
              |   - Will retry next cycle
```

### Flow 5: Asset Upload and AI Analysis

```
User uploads file(s) via Asset Library
    |
    v
[Frontend: validate file type, size]
    |
    v
[Upload to API -> stream to Object Storage]
    |
    v
[Create asset record in DB:]
    - user_id, product_id
    - file_url (S3/R2 URL)
    - file_type, file_size
    - user-provided tag (screenshot, photo, logo, etc.)
    - user-provided description (optional)
    - ai_analysis = null
    - status = "uploaded"
    |
    v
[Enqueue "analyze-asset" job with asset_id]
    |
    v
[Worker picks up job]
    |
    v
[Download image from Object Storage]
    |
    v
[Send to vision-capable LLM (Claude/GPT-4V):]
    - "Analyze this brand asset. Identify:
       dominant colors (hex), visual style (minimalist/bold/etc),
       mood, content type, text present,
       how it could be used in social media marketing"
    |
    v
[Parse structured response]
    |
    v
[Store AI analysis on asset record:]
    - ai_analysis: {
        colors: ["#FF5733", "#2E86AB"],
        style: "minimalist, modern",
        mood: "professional, approachable",
        content_type: "product screenshot",
        text_detected: "Dashboard view",
        marketing_uses: ["feature highlight", "tutorial content"]
      }
    - status = "analyzed"
    |
    v
[This analysis feeds into content plan + image generation prompts]
```

---

## Recommended Architecture Decisions

### 1. API Layer: tRPC over REST

**Use tRPC** because the frontend and backend share the same TypeScript codebase in Next.js. tRPC provides:
- End-to-end type safety without code generation
- No API schema maintenance (types flow from server to client)
- Smaller bundle than GraphQL
- Natural fit for Next.js App Router

For the LinkedIn OAuth callback and webhook endpoints, use standard Next.js API routes (these are external-facing and don't benefit from tRPC).

**Confidence:** HIGH -- tRPC with Next.js is a well-established pattern.

### 2. Background Jobs: Use a Dedicated Job Queue Library

**Use BullMQ with Redis** (or pgboss with PostgreSQL if you want to avoid Redis). The choice depends on stack:

**Recommended: BullMQ + Redis** because:
- Battle-tested at scale, excellent reliability
- Built-in retry logic, exponential backoff, dead letter queues
- Job progress tracking (critical for AI generation UX)
- Delayed jobs and rate limiting built-in
- Dashboard (Bull Board) for monitoring
- Concurrency controls per queue

**Alternative: pgboss** if you want to avoid adding Redis:
- Uses PostgreSQL as the queue backend
- Simpler deployment (no Redis needed)
- Good enough for moderate scale (thousands of jobs/hour)
- Less ecosystem/tooling than BullMQ

**Do NOT use:** Vercel serverless cron or edge functions for this. AI generation tasks can run 30-120 seconds. Serverless has timeout limits and cold start issues. You need a persistent worker process.

**Confidence:** HIGH -- BullMQ is the standard Node.js job queue.

### 3. Scheduler: Dedicated Polling Loop, NOT Cron

**Use a dedicated scheduler process** that runs a polling loop, NOT OS-level cron or Vercel cron.

```typescript
// scheduler.ts -- runs as its own process
async function schedulerLoop() {
  while (true) {
    try {
      const duePosts = await db.query(`
        SELECT * FROM posts
        WHERE status = 'scheduled'
        AND scheduled_at <= NOW()
        AND retry_count < 3
        ORDER BY scheduled_at ASC
        LIMIT 10
        FOR UPDATE SKIP LOCKED
      `);

      for (const post of duePosts) {
        await publishPost(post); // includes retry logic
      }
    } catch (error) {
      logger.error('Scheduler cycle error:', error);
    }

    await sleep(60_000); // 60 seconds
  }
}
```

Why this over cron:
- **Reliability:** If a cycle fails, the loop continues. Cron can silently fail.
- **Overlap prevention:** `FOR UPDATE SKIP LOCKED` prevents double-publishing even with multiple scheduler instances.
- **Observability:** The process can report health, last-run time, errors.
- **No external dependency:** No Vercel cron, no OS crontab.

**Confidence:** HIGH -- this is the standard pattern for reliable job scheduling in Node.js applications.

### 4. Real-Time Progress: Server-Sent Events (SSE) or Polling

For showing AI generation progress to users, two viable options:

**Recommended: Polling** for Phase 1 simplicity:
```
Frontend: GET /api/jobs/:jobId/progress every 2 seconds
Response: { status: "generating", progress: "creating_copy", percent: 60 }
```

**Upgrade to SSE in Phase 2** if you want smoother UX:
```
Frontend: EventSource('/api/jobs/:jobId/stream')
Server:   Sends progress events as worker updates DB/Redis
```

Polling is simpler, has no infrastructure requirements, works behind all proxies/CDNs, and is perfectly adequate for updates every 2-3 seconds.

**Do NOT use WebSockets** for this. WebSockets are overkill for one-directional progress updates and add significant deployment complexity.

**Confidence:** HIGH

### 5. File Storage Architecture

```
Upload Flow:
  Browser --[multipart/form-data]--> API Route
    |
    v
  API Route --[stream]--> S3/R2 (direct upload)
    |
    v
  Store URL reference in database

Serving Flow:
  Browser --[GET]--> CDN (CloudFront/R2 public) --[cache miss]--> S3/R2

Presigned URL Flow (for private assets):
  API generates presigned URL --> Browser fetches directly from S3/R2
```

**Use presigned upload URLs** for large files to avoid proxying through your server:
1. Frontend requests upload URL from API
2. API generates presigned S3/R2 PUT URL
3. Frontend uploads directly to storage
4. Frontend notifies API of completion
5. API creates asset record

**Confidence:** HIGH -- standard pattern for file uploads in web applications.

### 6. OAuth Token Management

LinkedIn OAuth tokens need careful lifecycle management:

```
Token Storage (encrypted at rest):
  platform_accounts table:
    - access_token (encrypted)
    - refresh_token (encrypted)
    - token_expires_at
    - account_type (personal | company_page)
    - platform_user_id
    - platform_user_name

Token Refresh Flow:
  Before any API call:
    1. Check token_expires_at
    2. If expired or expiring within 5 minutes:
       a. Call refresh endpoint
       b. Update stored tokens
       c. Proceed with new token
    3. If refresh fails:
       a. Mark account as "needs_reconnect"
       b. Surface to user in dashboard
```

**Important:** LinkedIn access tokens expire in 60 days. Refresh tokens expire in 365 days. You MUST handle both cases.

**Encrypt tokens at rest** using application-level encryption (e.g., AES-256-GCM with a key from environment variables), not just database-level encryption.

**Confidence:** MEDIUM -- LinkedIn OAuth specifics should be verified against current API docs.

---

## Database Schema (Core Entities)

### Entity Relationship Overview

```
users
  |-- 1:N --> products
  |              |-- 1:N --> assets
  |              |-- 1:N --> content_plans
  |              |            |-- 1:N --> posts
  |              |-- 1:N --> platform_accounts
  |              |-- 1:1 --> product_briefs
  |
  |-- sessions (auth)
```

### Core Tables

```sql
-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Products (one per user in Phase 1, multiple in Phase 2)
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  website_url   TEXT,
  description   TEXT,
  logo_url      TEXT,
  scraped_data  JSONB,          -- extracted website data
  onboarding_step TEXT DEFAULT 'quick_start', -- quick_start | deep_brief | complete
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Product Briefs (the deep brief data)
CREATE TABLE product_briefs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  -- Product details
  problem_solved    TEXT,
  key_features      TEXT[],
  differentiator    TEXT,
  pricing_info      TEXT,
  product_stage     TEXT,        -- idea | beta | launched | established
  -- Audience
  ideal_customer    TEXT,
  industry          TEXT,
  age_range         TEXT,
  pain_points       TEXT[],
  audience_hangouts TEXT[],
  -- Brand voice
  personality_traits TEXT[],     -- ['professional', 'witty', 'bold']
  example_content   TEXT,
  words_to_use      TEXT[],
  words_to_avoid    TEXT[],
  -- Goals
  main_goal         TEXT,        -- awareness | leads | sales | community
  posting_frequency TEXT,        -- daily | 3x_week | 5x_week | custom
  preferred_times   JSONB,       -- or null for AI-optimized
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Assets (brand images, screenshots, etc.)
CREATE TABLE assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  file_url      TEXT NOT NULL,
  file_name     TEXT NOT NULL,
  file_type     TEXT NOT NULL,   -- image/png, image/jpeg, etc.
  file_size     INTEGER,
  tag           TEXT,            -- screenshot | photo | logo | lifestyle | testimonial | graphic
  description   TEXT,            -- user-provided
  is_primary    BOOLEAN DEFAULT FALSE,
  ai_analysis   JSONB,           -- vision model analysis results
  analysis_status TEXT DEFAULT 'pending', -- pending | analyzing | analyzed | failed
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Accounts (OAuth connections)
CREATE TABLE platform_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL,  -- linkedin (future: instagram, twitter)
  account_type    TEXT NOT NULL,  -- personal | company_page
  platform_user_id TEXT NOT NULL,
  platform_user_name TEXT,
  platform_avatar_url TEXT,
  access_token    TEXT NOT NULL,  -- encrypted
  refresh_token   TEXT,           -- encrypted
  token_expires_at TIMESTAMPTZ,
  status          TEXT DEFAULT 'active', -- active | needs_reconnect | revoked
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, platform, platform_user_id)
);

-- Content Plans
CREATE TABLE content_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  status        TEXT DEFAULT 'generating', -- generating | complete | failed
  progress      TEXT,            -- current step description for UI
  strategy_overview TEXT,
  themes        TEXT[],
  date_range_start DATE,
  date_range_end   DATE,
  generation_params JSONB,       -- snapshot of inputs used for generation
  error_message TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Posts (individual content pieces)
CREATE TABLE posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_plan_id UUID REFERENCES content_plans(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
  platform_account_id UUID REFERENCES platform_accounts(id),
  -- Content
  copy_text       TEXT,
  copy_hook       TEXT,
  copy_cta        TEXT,
  hashtags        TEXT[],
  image_url       TEXT,           -- URL in object storage
  image_prompt    TEXT,           -- the prompt used to generate the image
  -- Scheduling
  scheduled_at    TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,
  -- Metadata from plan
  topic           TEXT,
  angle           TEXT,
  content_category TEXT,          -- educational | promotional | social_proof | etc.
  post_type       TEXT,           -- static_image | text_only (future: carousel | reel)
  key_message     TEXT,
  suggested_asset_ids UUID[],
  -- Status
  status          TEXT DEFAULT 'draft',
    -- draft | generating | pending_review | approved | scheduled | publishing | published | failed
  retry_count     INTEGER DEFAULT 0,
  error_message   TEXT,
  -- Platform response
  platform_post_id  TEXT,
  platform_post_url TEXT,
  -- Tracking
  generation_job_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Background Jobs tracking (if using pgboss, this is built-in)
-- If using BullMQ, you may still want a lightweight job_progress table
CREATE TABLE job_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type    TEXT NOT NULL,      -- plan_generation | post_generation | asset_analysis | url_scrape
  entity_id   UUID NOT NULL,     -- the plan/post/asset ID this job is for
  status      TEXT DEFAULT 'queued', -- queued | running | completed | failed
  progress    TEXT,              -- human-readable current step
  percent     INTEGER,           -- 0-100
  error       TEXT,
  started_at  TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at)
  WHERE status = 'scheduled' AND retry_count < 3;
CREATE INDEX idx_posts_product ON posts(product_id);
CREATE INDEX idx_posts_plan ON posts(content_plan_id);
CREATE INDEX idx_assets_product ON assets(product_id);
CREATE INDEX idx_content_plans_product ON content_plans(product_id);
CREATE INDEX idx_platform_accounts_product ON platform_accounts(product_id);
```

### Schema Design Rationale

1. **JSONB for flexible data:** `scraped_data`, `ai_analysis`, `generation_params` use JSONB because their structure varies and evolves. Structured fields (like `personality_traits`) use typed columns when they have known shapes.

2. **Separate `product_briefs` table:** Keeps the `products` table lean. The brief is loaded separately and only when needed (plan generation, not calendar display).

3. **`suggested_asset_ids` as UUID array:** Allows the plan to reference specific assets for each post without a join table. Simple enough for Phase 1.

4. **Partial index on `posts.scheduled_at`:** The scheduler query only cares about scheduled, non-exhausted posts. A partial index keeps this query fast as the posts table grows.

5. **`FOR UPDATE SKIP LOCKED` in scheduler:** Prevents duplicate publishing when multiple scheduler instances run (or a cycle takes longer than 60 seconds).

---

## AI Generation Pipeline Architecture (Detailed)

This is the most architecturally complex part of BriefAgent. Here is the detailed design.

### Pipeline Overview

```
Brand Intelligence Layer
   (asset analysis + brief data + scraped data)
          |
          v
   Plan Generation Layer
   (strategy + post slot creation)
          |
          v
   Post Generation Layer
   (copy + image, per post)
```

### Layer 1: Brand Intelligence

This is NOT a runtime step -- it happens asynchronously when assets are uploaded and when the brief is saved. By the time plan/post generation runs, brand intelligence is pre-computed and cached.

```typescript
interface BrandIntelligence {
  // From product brief
  voice: {
    traits: string[];       // ['professional', 'witty']
    wordsToUse: string[];
    wordsToAvoid: string[];
    exampleContent: string;
  };

  // From asset AI analysis (aggregated across all assets)
  visualIdentity: {
    dominantColors: string[];       // ['#FF5733', '#2E86AB']
    colorDescriptions: string[];    // ['warm orange', 'ocean blue']
    visualStyle: string;            // 'minimalist and modern'
    mood: string;                   // 'professional but approachable'
    consistentElements: string[];   // ['clean layouts', 'bold typography']
    photographyStyle?: string;      // 'lifestyle, bright lighting'
  };

  // From scraped website data
  webPresence: {
    tagline?: string;
    keyPhrases: string[];
    siteDescription?: string;
  };

  // Computed: combined brand description for prompts
  brandSummary: string;  // Pre-assembled paragraph for LLM context
}
```

**How brand intelligence is assembled:**

```typescript
async function assembleBrandIntelligence(productId: string): Promise<BrandIntelligence> {
  const [product, brief, assets] = await Promise.all([
    db.products.findById(productId),
    db.productBriefs.findByProductId(productId),
    db.assets.findByProductId(productId, { status: 'analyzed' }),
  ]);

  // Aggregate visual identity from all analyzed assets
  const visualIdentity = aggregateVisualAnalysis(assets.map(a => a.aiAnalysis));

  // Build brand summary paragraph
  const brandSummary = buildBrandSummary(product, brief, visualIdentity);

  return { voice: brief.voice, visualIdentity, webPresence: product.scrapedData, brandSummary };
}
```

### Layer 2: Plan Generation

```typescript
// Plan generation worker
async function generatePlan(planId: string) {
  const plan = await db.contentPlans.findById(planId);
  const product = await db.products.findById(plan.productId);
  const brandIntel = await assembleBrandIntelligence(product.id);
  const platformAccounts = await db.platformAccounts.findByProductId(product.id);
  const previousPlans = await db.contentPlans.findRecent(product.id, { limit: 3 });

  await updateProgress(planId, 'assembling_context', 10);

  // Build the LLM prompt
  const systemPrompt = `You are an expert social media strategist.
You create 2-week content plans for brands.

BRAND CONTEXT:
${brandIntel.brandSummary}

BRAND VOICE: ${brandIntel.voice.traits.join(', ')}
Words to use: ${brandIntel.voice.wordsToUse.join(', ')}
Words to avoid: ${brandIntel.voice.wordsToAvoid.join(', ')}

CONNECTED PLATFORMS: ${platformAccounts.map(a => a.platform).join(', ')}
POSTING FREQUENCY: ${product.brief.postingFrequency}

CONSTRAINTS:
- Maximum 30% promotional content
- Each post must have a clear purpose and angle
- Vary content categories across the plan
- Consider optimal posting times for each platform

AVAILABLE ASSETS (reference by ID in your plan):
${assets.map(a => `ID: ${a.id} | Type: ${a.tag} | Description: ${a.description || a.aiAnalysis?.contentType}`).join('\n')}

PREVIOUS PLAN THEMES (avoid repetition):
${previousPlans.map(p => p.themes?.join(', ')).join('; ')}`;

  const userPrompt = `Create a 2-week content plan starting ${startDate}.
Generate ${calculatePostCount(product.brief.postingFrequency, 14)} posts.

Return JSON in this exact structure:
{
  "strategyOverview": "string - 2-3 sentence strategy explanation",
  "themes": ["theme1", "theme2", "theme3"],
  "posts": [
    {
      "dayOffset": 0,
      "timeSlot": "09:00",
      "platform": "linkedin",
      "postType": "static_image",
      "topic": "string",
      "angle": "string",
      "contentCategory": "educational|promotional|social_proof|behind_the_scenes|engagement|tips|announcement|storytelling",
      "keyMessage": "string",
      "hookIdea": "string",
      "suggestedAssetIds": ["uuid"] or [],
      "notes": "string"
    }
  ]
}`;

  await updateProgress(planId, 'generating_strategy', 30);

  const response = await llm.chat({
    model: 'claude-sonnet-4-20250514', // Good balance of quality and cost for planning
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 4000,
  });

  await updateProgress(planId, 'creating_post_slots', 70);

  const planData = JSON.parse(response.content);

  // Validate and create post records
  const posts = await createPostsFromPlan(plan, planData, platformAccounts);

  await updateProgress(planId, 'complete', 100);
  await db.contentPlans.update(planId, {
    status: 'complete',
    strategyOverview: planData.strategyOverview,
    themes: planData.themes,
  });
}
```

### Layer 3: Post Generation (Copy + Image in Parallel)

```typescript
async function generatePost(postId: string) {
  const post = await db.posts.findById(postId);
  const product = await db.products.findById(post.productId);
  const brandIntel = await assembleBrandIntelligence(product.id);

  await updateProgress(postId, 'starting_generation', 5);

  // Run copy and image generation in parallel
  const [copyResult, imageResult] = await Promise.allSettled([
    generateCopy(post, brandIntel),
    generateImage(post, brandIntel),
  ]);

  // Handle partial success: copy can succeed even if image fails
  if (copyResult.status === 'fulfilled') {
    await db.posts.update(postId, {
      copyText: copyResult.value.text,
      copyHook: copyResult.value.hook,
      copyCta: copyResult.value.cta,
      hashtags: copyResult.value.hashtags,
    });
  }

  if (imageResult.status === 'fulfilled') {
    await db.posts.update(postId, {
      imageUrl: imageResult.value.url,
      imagePrompt: imageResult.value.prompt,
    });
  }

  // Determine final status
  const bothSucceeded = copyResult.status === 'fulfilled' && imageResult.status === 'fulfilled';
  const bothFailed = copyResult.status === 'rejected' && imageResult.status === 'rejected';

  if (bothSucceeded) {
    await db.posts.update(postId, { status: 'pending_review' });
  } else if (bothFailed) {
    await db.posts.update(postId, { status: 'failed', errorMessage: 'Both copy and image generation failed' });
  } else {
    // Partial success: still show for review, flag what failed
    await db.posts.update(postId, {
      status: 'pending_review',
      errorMessage: copyResult.status === 'rejected'
        ? 'Copy generation failed - image ready, please write copy manually'
        : 'Image generation failed - copy ready, please upload image manually',
    });
  }
}
```

### Image Generation Sub-Pipeline (The Hard Part)

```typescript
async function generateImage(
  post: Post,
  brandIntel: BrandIntelligence
): Promise<{ url: string; prompt: string }> {

  // Step 1: Use LLM to create an image generation prompt
  // This is a "prompt engineering" step -- the LLM translates brand context
  // into a specific visual description for the image generation model
  const imagePromptResponse = await llm.chat({
    model: 'claude-sonnet-4-20250514',
    messages: [
      {
        role: 'system',
        content: `You are an expert art director creating image briefs for AI image generation.

BRAND VISUAL IDENTITY:
- Colors: ${brandIntel.visualIdentity.dominantColors.join(', ')} (${brandIntel.visualIdentity.colorDescriptions.join(', ')})
- Style: ${brandIntel.visualIdentity.visualStyle}
- Mood: ${brandIntel.visualIdentity.mood}
- Consistent elements: ${brandIntel.visualIdentity.consistentElements.join(', ')}

Create image prompts that:
1. Feel visually coherent with the brand's existing assets
2. Are appropriate for social media (eye-catching, clear, not too busy)
3. Match the post's topic and category
4. Work well at ${post.platform === 'linkedin' ? '1200x627' : '1080x1080'} dimensions
5. Never include text in the image (text goes in the post copy)
6. Describe style, composition, colors, mood, and subject matter explicitly`
      },
      {
        role: 'user',
        content: `Create an image prompt for this social media post:
Topic: ${post.topic}
Angle: ${post.angle}
Category: ${post.contentCategory}
Key message: ${post.keyMessage}
Platform: ${post.platform}

Return JSON: { "prompt": "detailed image generation prompt", "negativePrompt": "what to avoid" }`
      }
    ],
    response_format: { type: 'json_object' },
  });

  const { prompt, negativePrompt } = JSON.parse(imagePromptResponse.content);

  // Step 2: Call image generation API
  const imageResponse = await imageGen.generate({
    prompt: prompt,
    negative_prompt: negativePrompt,
    size: post.platform === 'linkedin' ? '1792x1024' : '1024x1024',
    quality: 'hd',
    style: 'natural', // not 'vivid' -- brand-appropriate, not over-saturated
  });

  // Step 3: Upload generated image to object storage
  const imageBuffer = await downloadImage(imageResponse.url);
  const storedUrl = await storage.upload(
    `generated/${post.productId}/${post.id}.png`,
    imageBuffer,
    'image/png'
  );

  return { url: storedUrl, prompt };
}
```

### AI Model Selection Strategy

| Task | Recommended Model | Rationale |
|------|-------------------|-----------|
| **Content plan generation** | Claude Sonnet (claude-sonnet-4) | Best balance of quality, structured output reliability, and cost for strategy work |
| **Copy generation** | Claude Sonnet (claude-sonnet-4) | Excellent at marketing copy, follows brand voice well, reliable JSON output |
| **Image prompt engineering** | Claude Sonnet (claude-sonnet-4) | Needs to translate brand context into visual descriptions -- language task |
| **Image generation** | DALL-E 3 or Ideogram v2 | DALL-E 3 for quality and consistency; Ideogram if text-in-image ever needed |
| **Asset analysis (vision)** | Claude Sonnet (claude-sonnet-4) with vision | Strong at visual analysis, can describe colors/style/mood accurately |
| **URL scraping analysis** | Claude Haiku (claude-haiku) | Simple extraction task, doesn't need heavy model |

**Cost management:**
- Plan generation: ~$0.03-0.05 per plan (one LLM call with large context)
- Post copy: ~$0.01-0.02 per post
- Image prompt: ~$0.01 per post
- Image generation: ~$0.04-0.08 per image (DALL-E 3 HD)
- Asset analysis: ~$0.01-0.03 per asset
- **Total per post: ~$0.06-0.15**
- **Total per 2-week plan (10 posts): ~$0.65-1.55**

**Confidence:** MEDIUM -- Model costs fluctuate and new models emerge. These estimates are directional. Verify current pricing before launch.

---

## Patterns to Follow

### Pattern 1: Command/Query Separation for AI Jobs

**What:** Separate "start the job" (command) from "check job status" (query). Never block an HTTP request waiting for AI generation.

**When:** Any AI generation or long-running task.

**Example:**
```typescript
// Command: Start generation (returns immediately)
export async function startPlanGeneration(productId: string) {
  const plan = await db.contentPlans.create({
    productId,
    status: 'generating',
  });

  await jobQueue.add('generate-plan', { planId: plan.id });

  return { planId: plan.id, status: 'generating' };
}

// Query: Check progress (called by frontend polling)
export async function getPlanProgress(planId: string) {
  const progress = await db.jobProgress.findByEntityId(planId);
  return {
    status: progress.status,
    step: progress.progress,
    percent: progress.percent,
  };
}
```

### Pattern 2: Idempotent Job Processing

**What:** Jobs can be safely retried without side effects (duplicate posts, duplicate images).

**When:** All background jobs.

**Example:**
```typescript
async function generatePostJob(postId: string) {
  const post = await db.posts.findById(postId);

  // Idempotency check: if already generated, skip
  if (post.status === 'pending_review' || post.status === 'approved') {
    logger.info(`Post ${postId} already generated, skipping`);
    return;
  }

  // Idempotency: if image already exists, don't regenerate
  const needsCopy = !post.copyText;
  const needsImage = !post.imageUrl;

  // Only generate what's missing
  // ...
}
```

### Pattern 3: Graceful Degradation

**What:** When one part of generation fails, save what succeeded and let the user fix the rest manually.

**When:** Post generation (copy and image are independent), URL scraping.

**Example:** See the `Promise.allSettled` pattern in Flow 3 above. Copy and image generation run in parallel. If image fails but copy succeeds, the post still enters "pending_review" with a note that image generation failed.

### Pattern 4: Context Snapshot for Reproducibility

**What:** When generating content, snapshot the inputs used so the generation can be understood and debugged later.

**When:** Plan generation, post generation.

**Example:**
```typescript
// Store the exact inputs used for this generation
await db.contentPlans.update(planId, {
  generationParams: {
    briefVersion: brief.updatedAt,
    assetCount: assets.length,
    assetIds: assets.map(a => a.id),
    platforms: platformAccounts.map(a => a.platform),
    frequency: brief.postingFrequency,
    modelUsed: 'claude-sonnet-4-20250514',
    promptVersion: '1.0',
  }
});
```

### Pattern 5: Encrypted Secrets with Application-Level Encryption

**What:** OAuth tokens encrypted before storage, decrypted only at use time.

**When:** Storing any third-party credentials.

**Example:**
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY; // 32 bytes, hex-encoded

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(encrypted: string): string {
  const [ivHex, tagHex, dataHex] = encrypted.split(':');
  const decipher = createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return decipher.update(dataHex, 'hex', 'utf8') + decipher.final('utf8');
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Synchronous AI Generation

**What:** Calling the LLM or image generation API within an HTTP request handler and making the user wait.

**Why bad:** AI generation takes 10-120 seconds. HTTP timeouts, user frustration, connection drops, server resource exhaustion. Vercel serverless functions have 10s default timeout (60s max on Pro).

**Instead:** Always dispatch to a background job. Return a job ID. Frontend polls for progress.

### Anti-Pattern 2: Monolithic LLM Prompts

**What:** Cramming plan generation AND post generation into one giant LLM call.

**Why bad:** Unreliable output (too many instructions), impossible to partially retry, higher cost on failure, longer latency, harder to debug.

**Instead:** Separate plan generation from post generation. Plan creates the structure; individual post generation fills in the content. This is the pipeline pattern.

### Anti-Pattern 3: Storing Generated Images in the Database

**What:** Saving image binary data as BLOB/bytea in PostgreSQL.

**Why bad:** Database bloat, slow queries, no CDN caching, expensive database storage, backup size explosion.

**Instead:** Store images in object storage (S3/R2), store only the URL reference in the database.

### Anti-Pattern 4: Polling LinkedIn API for Post Status

**What:** After publishing, repeatedly checking LinkedIn API to verify the post was published.

**Why bad:** Unnecessary API calls, rate limit consumption, adds no value (the publish call itself returns success/failure).

**Instead:** Trust the API response. If 201 Created, it's published. Store the response ID and construct the post URL. Only surface errors from the publish call itself.

### Anti-Pattern 5: Shared Mutable State Between Workers

**What:** Workers communicating via shared memory, global variables, or in-memory caches.

**Why bad:** Workers may run in separate processes or containers. Race conditions, stale data, impossible to debug.

**Instead:** Workers communicate exclusively through the database and job queue. Each worker is stateless and idempotent.

### Anti-Pattern 6: OAuth Token in Frontend

**What:** Exposing LinkedIn access tokens to the browser client.

**Why bad:** Security risk. Tokens can be stolen via XSS, browser extensions, or network interception.

**Instead:** All OAuth flows handled server-side. Frontend never sees tokens. API routes proxy all platform API calls.

---

## Deployment Architecture

### Recommended: Single VPS or Railway/Render

For Phase 1, deploy everything on one machine or PaaS:

```
+-----------------------------------------------------+
|  VPS / Railway / Render                              |
|                                                      |
|  [Web Server Process]  - Next.js (port 3000)         |
|  [Worker Process]      - BullMQ worker               |
|  [Scheduler Process]   - Polling loop                |
|  [Redis]               - Job queue + cache           |
|  [PostgreSQL]          - Main database               |
|                                                      |
+-----------------------------------------------------+
|  External:                                           |
|  [Cloudflare R2]       - Object storage + CDN        |
|  [Resend]              - Transactional email          |
|  [Anthropic API]       - LLM calls                   |
|  [OpenAI API]          - Image generation             |
+-----------------------------------------------------+
```

**Why not Vercel for everything:** Vercel's serverless model doesn't support long-running background workers or persistent scheduler loops. You'd need a separate service for workers anyway. Simpler to just deploy everything together on Railway/Render.

**Alternative:** Use Vercel for the Next.js frontend + API routes, and Railway for the worker + scheduler processes. This works but adds deployment complexity for minimal benefit at Phase 1 scale.

### Process Management

Use a process manager (PM2) or container orchestration to run three processes:

```yaml
# docker-compose.yml (or equivalent)
services:
  web:
    command: node server.js
    ports: ["3000:3000"]

  worker:
    command: node worker.js
    deploy:
      replicas: 1  # Scale to 2+ if needed

  scheduler:
    command: node scheduler.js
    deploy:
      replicas: 1  # EXACTLY 1 (or use SKIP LOCKED)
```

**Confidence:** HIGH -- standard deployment pattern for Node.js applications with background processing.

---

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **AI generation throughput** | Single worker, sequential | 2-4 workers, concurrent | Dedicated GPU instances, queue prioritization |
| **Scheduler reliability** | Single loop, adequate | Still single loop, `SKIP LOCKED` | Multiple scheduler instances with distributed locking |
| **Database load** | Single PostgreSQL, no issues | Read replicas for dashboard queries | Sharding by tenant, dedicated connection pools |
| **File storage** | R2/S3 with CDN, trivial | Same, no changes needed | Same, CDN handles scale |
| **OAuth token management** | In application memory during use | Same, stateless per-request | Token cache in Redis to reduce DB reads |
| **Cost** | ~$50/mo infrastructure + AI costs | ~$200/mo infra + AI costs | Dedicated infrastructure, AI cost optimization critical |

**The bottleneck will be AI generation cost, not infrastructure.** At 10K users generating 10 posts/week each, that's 100K posts/week. At $0.10/post, that's $10K/week in AI costs. Infrastructure costs are negligible by comparison. **Pricing must account for per-post AI costs from day one.**

---

## Suggested Build Order

Based on component dependencies, here is the recommended build order.

### Level 0: Foundation (must exist first)
1. **Database schema + migrations** -- everything depends on this
2. **Authentication** -- every protected route needs this
3. **Project structure** -- Next.js app, folder conventions, shared types

### Level 1: Core Data (depends on foundation)
4. **Product CRUD** -- products table, basic create/read
5. **Quick Start onboarding** -- product creation flow
6. **File upload infrastructure** -- S3/R2 integration, presigned URLs
7. **Asset management** -- upload, tag, store

### Level 2: AI Infrastructure (depends on core data)
8. **Job queue setup** -- BullMQ + Redis, worker process
9. **URL scraping worker** -- first background job, validates the pattern
10. **Asset analysis worker** -- vision model integration, brand intelligence

### Level 3: Brief + Planning (depends on AI infrastructure)
11. **Deep Brief wizard** -- product_briefs table, wizard UI
12. **Brand intelligence assembly** -- aggregation function
13. **Content plan generation** -- LLM integration, plan worker, progress UI
14. **Post slot creation** -- creating draft posts from plan data

### Level 4: Content Generation (depends on planning)
15. **Copy generation worker** -- LLM call for post copy
16. **Image generation worker** -- image gen API + prompt engineering
17. **Post generation orchestration** -- parallel copy + image, status management
18. **Post preview/review UI** -- display generated content, approval flow

### Level 5: Publishing (depends on content generation)
19. **LinkedIn OAuth flow** -- connect accounts, store tokens
20. **Token management** -- encryption, refresh logic
21. **Scheduler process** -- polling loop, publish logic
22. **Publishing UI** -- status display, error surfacing, retry

### Level 6: Calendar + Polish (depends on everything above)
23. **Content calendar views** -- monthly/weekly, color-coded statuses
24. **Post editing** -- modify copy, swap images, change schedule
25. **Regeneration** -- re-generate copy, image, or both
26. **Dashboard** -- overview stats, upcoming posts, recent activity

```
Build dependency graph:

Foundation ─┬─> Core Data ─┬─> AI Infra ─┬─> Brief + Planning ─> Content Gen ─> Publishing
             |               |              |
             |               |              └─> Asset Analysis
             |               └─> File Uploads
             └─> Auth
                                                                         |
                                                                         v
                                                                   Calendar + Polish
```

---

## API Design Considerations

### tRPC Router Structure

```typescript
// Organized by domain, not by CRUD operation
const appRouter = router({
  auth: authRouter,           // login, register, verifyEmail, logout, session
  products: productsRouter,   // create, get, update, list
  briefs: briefsRouter,       // get, update (per product)
  assets: assetsRouter,       // upload, list, delete, getAnalysis
  plans: plansRouter,         // generate, list, get, getProgress
  posts: postsRouter,         // get, list, update, approve, reject, regenerate, schedule
  accounts: accountsRouter,   // connectLinkedIn, disconnect, list, getStatus
  calendar: calendarRouter,   // getMonth, getWeek (read-optimized views)
  jobs: jobsRouter,           // getProgress (generic job progress polling)
});
```

### Key API Endpoints (REST-style for reference)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-email
POST   /api/auth/logout

POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
PUT    /api/products/:id/brief

POST   /api/products/:id/assets          (multipart upload)
GET    /api/products/:id/assets
DELETE /api/assets/:id
GET    /api/assets/:id/analysis

POST   /api/products/:id/plans/generate  --> returns { planId, jobId }
GET    /api/plans/:id
GET    /api/plans/:id/progress           --> { status, step, percent }

GET    /api/posts/:id
PUT    /api/posts/:id                    (edit copy, schedule, etc.)
POST   /api/posts/:id/approve
POST   /api/posts/:id/reject
POST   /api/posts/:id/regenerate         { target: 'copy' | 'image' | 'both' }
POST   /api/posts/batch-generate         { postIds: [...] }

GET    /api/oauth/linkedin/authorize     --> redirect to LinkedIn
GET    /api/oauth/linkedin/callback      --> handle OAuth callback
GET    /api/accounts
DELETE /api/accounts/:id

GET    /api/calendar/:productId/month?year=2026&month=3
GET    /api/calendar/:productId/week?start=2026-03-01

GET    /api/jobs/:jobId/progress
```

### Pagination Pattern

```typescript
// Cursor-based pagination for lists
interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Usage: GET /api/products/:id/posts?cursor=abc&limit=20
```

---

## Security Architecture

### Authentication Flow
```
Registration:
  [Email + Password] --> hash with bcrypt (12 rounds) --> store hash
  [Send verification email via Resend]
  [User clicks link] --> verify token --> set email_verified_at

Login:
  [Email + Password] --> verify against hash
  [Create session] --> store in DB (sessions table) or use JWT
  [Set httpOnly, secure, sameSite cookie]

Session:
  [Every request] --> check session cookie --> load user from DB
  [If expired] --> redirect to login
```

**Use database-backed sessions** (not JWT) because:
- Sessions can be invalidated immediately (important for security)
- No token size concerns
- No refresh token complexity for auth (separate from OAuth)
- Session data can be extended without re-signing

### Authorization Model (Phase 1: Simple)
```
Middleware chain:
  1. requireAuth          --> user is logged in
  2. requireVerifiedEmail --> email is verified
  3. requireProductOwner  --> user owns the product being accessed
```

Phase 4 adds team roles; for now, it's simple ownership checks.

---

## Sources and Confidence Notes

| Topic | Confidence | Basis |
|-------|------------|-------|
| Monolith-first architecture | HIGH | Well-established pattern, appropriate for team size |
| BullMQ for job queue | HIGH | Standard Node.js job queue, widely used |
| PostgreSQL schema design | HIGH | Standard relational modeling |
| tRPC with Next.js | HIGH | Well-established pattern in TypeScript ecosystem |
| AI pipeline architecture (plan then post) | HIGH | Logical decomposition, matches the domain |
| Image generation prompt engineering via LLM | MEDIUM | Emerging pattern, specific model quality varies |
| LinkedIn OAuth token lifecycle (60-day access, 365-day refresh) | MEDIUM | Based on training data, verify against current LinkedIn API docs |
| AI generation cost estimates | LOW | Prices change frequently; these are directional estimates from training data |
| DALL-E 3 vs alternatives for image generation | MEDIUM | DALL-E 3 is well-known for quality; Ideogram, Flux, and newer models may be better -- verify at build time |
| Railway/Render deployment | MEDIUM | Good options at this scale; pricing and features may have changed |

### Gaps That Need Phase-Specific Research

1. **LinkedIn API current capabilities and rate limits** -- Must verify against current docs before building OAuth integration
2. **Image generation model comparison** -- DALL-E 3 vs Flux vs Ideogram for brand-consistent social media images. This needs hands-on testing, not just research.
3. **LLM structured output reliability** -- Claude and GPT-4 both support JSON mode, but reliability of complex plan structures needs testing
4. **Cloudflare R2 vs AWS S3** -- Both work; R2 is cheaper for egress. Verify current pricing and SDK support.
5. **BullMQ vs pgboss** -- Depends on whether adding Redis is acceptable. If stack already includes Redis, use BullMQ. If minimizing infrastructure, use pgboss.
