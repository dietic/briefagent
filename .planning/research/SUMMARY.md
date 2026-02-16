# Project Research Summary

**Project:** BriefAgent.ai
**Domain:** AI-powered social media marketing automation
**Researched:** 2026-02-15
**Confidence:** MEDIUM

## Executive Summary

BriefAgent is an AI-native social media marketing tool that occupies a genuinely novel position: deep product briefing driving full content strategy generation, truly AI-generated original images (not templates), and automated publishing. No existing competitor combines all three. The core insight is that comprehensive upfront context (product brief, brand assets, audience understanding) enables dramatically better downstream AI generation than prompt-by-prompt content creation.

The recommended technical approach is a **monolith-first architecture** with SvelteKit (for superior interactive UI handling over React), PostgreSQL/Supabase (relational data with bundled auth/storage/realtime), BullMQ job queues for AI generation pipelines, and Railway hosting (supports long-running workers natively). The stack deliberately avoids the Next.js/Vercel default because BriefAgent's needs—complex interactive dashboards, 30-120 second AI generation jobs, persistent background workers, and cron scheduling—are fundamentally at odds with serverless architecture.

The critical risks are all execution-level: LinkedIn OAuth token lifecycle management (tokens expire, refresh requires MDP approval), AI-generated content quality (must sound human and on-brand or users churn), and image generation consistency (current models struggle with brand coherence). These are mitigated through human-in-the-loop review flows, deep onboarding that captures voice/brand context, sophisticated prompt engineering, and proactive token health monitoring. The technical architecture is sound; the product risk is whether AI output quality meets professional LinkedIn standards consistently enough to build trust.

## Key Findings

### Recommended Stack

**SvelteKit wins over Next.js** for this specific product because BriefAgent is dashboard-first with extreme interactive complexity (content calendar with drag-drop, multi-step wizards, live preview/editing, asset management). Svelte's reactivity model ($state, $derived, $effect runes) handles complex stateful UIs with dramatically less code than React hooks. Next.js's App Router Server Components create constant friction for highly interactive pages—you'd be fighting the framework's server-first model. The deployment flexibility is also critical: Railway can host SvelteKit + BullMQ workers + cron scheduler in one unified deployment, while Next.js on Vercel would require splitting workers to a separate platform anyway.

**Core technologies:**
- **SvelteKit 2.x + Svelte 5**: Full-stack framework with superior interactive UI handling for calendars, wizards, and complex forms. Smaller bundle size than React matters for daily-use dashboards.
- **PostgreSQL via Supabase**: Relational model is ideal for Products->Briefs->Plans->Posts->Assets hierarchy. Supabase bundles database + auth + file storage + realtime subscriptions, replacing 4 separate services.
- **BullMQ + Redis**: Battle-tested job queue for AI generation pipeline. Supports priorities, progress tracking, retries, rate limiting, and concurrency control—all critical for managing LLM/image generation workflows.
- **Railway hosting**: Supports long-running worker processes and cron natively. Not serverless. Single deployment for web + workers + scheduler.
- **Claude Sonnet for copy/strategy**: Best at nuanced marketing copy and brand voice adherence. GPT-4o for vision analysis and fallback.
- **Flux 1.1 Pro for images**: Superior prompt adherence for brand-coherent generation. DALL-E 3 as fallback.
- **Drizzle ORM**: Lighter than Prisma, better TypeScript inference, faster cold starts, SQL-like syntax.

**Critical version note:** Research based on training data through May 2025. Specific versions (Svelte 5, Flux 1.1 Pro, Tailwind 4) should be verified against current docs. The architectural decisions (relational DB, job queue, multi-provider AI, monolith-first) are sound regardless of version drift.

### Expected Features

**Must have (table stakes):**
- Email/password auth with verification
- LinkedIn OAuth connection (60-day token expiry, refresh requires MDP approval)
- Content calendar (monthly/weekly views, drag-to-reschedule, status indicators)
- Post scheduling with timezone-aware publishing
- Auto-publishing with retry logic
- Post preview matching LinkedIn's native format
- Edit before publishing (copy, image, hashtags, schedule)
- AI copy generation (platform-optimized, brand voice adherent)
- AI image generation (original, not templates—the differentiator)
- Onboarding flow getting users to first value in 5-10 minutes
- Post status tracking (draft, generating, pending review, scheduled, published, failed)

**Should have (competitive differentiators):**
- "Brief once" deep product onboarding—the strategic moat. No competitor asks users to comprehensively describe product, audience, brand voice, and goals upfront.
- Full content strategy generation (2-week plan with themes, content category balancing, strategic sequencing)
- Brand-informed visual coherence (AI analyzes uploaded assets to extract colors, style, mood; generates images that feel on-brand)
- Granular regeneration (regenerate just copy, just image, or both—not all-or-nothing)
- Website auto-scraping during onboarding to reduce friction (with graceful fallback to manual)
- Zero-skill targeting (AI is the marketing expert, user just approves—no jargon)

**Defer (v2+):**
- Autopilot mode (auto-publish without review—requires trust baseline from 10+ approved posts)
- Carousels and reels (format complexity, video AI still maturing)
- Instagram publishing (Meta App Review bottleneck)
- Billing/monetization (validate PMF first)
- Analytics integration (need publishing volume first)
- Multi-product support (single product sufficient for MVP validation)
- Team collaboration / approval workflows
- Social listening / monitoring (enterprise feature, different product category)

### Architecture Approach

**Monolith-first with asynchronous job processing**—not microservices. Web application, background worker process, and scheduler process share a single codebase and database but run as separate deployment units. This is a deployment topology choice, not an architectural one. Workers communicate exclusively through the database and job queue (never shared memory or RPC).

**Major components:**
1. **Web application (SvelteKit)**: HTTP routes, SSR, authentication, API endpoints (tRPC for type safety). Enqueues jobs to BullMQ. Never blocks on AI generation.
2. **Background workers (BullMQ)**: Execute long-running AI tasks. Four worker types: (a) plan generation (assembles context, calls LLM, creates post slots), (b) post generation (copy + image in parallel), (c) asset analysis (vision model extracts brand style), (d) URL scraping (onboarding enhancement).
3. **Scheduler process**: Dedicated polling loop (runs every 60s) that queries for due posts and publishes via LinkedIn API. Uses `FOR UPDATE SKIP LOCKED` to prevent duplicate publishing. Not OS cron—a persistent process with retry logic.
4. **Database (PostgreSQL/Supabase)**: All domain data. Tables: users, products, product_briefs, assets, platform_accounts, content_plans, posts, job_progress. JSONB columns for flexible AI response data.
5. **Object storage (Supabase Storage / S3/R2)**: Uploaded brand assets and generated images. CDN-backed. Presigned URLs for direct upload/download.

**Critical data flows:**
- **Plan generation**: User triggers -> create plan record (status: generating) -> enqueue job -> worker assembles context (brief + assets + previous plans) -> LLM call with structured output -> parse JSON -> create post slot records -> mark plan complete.
- **Post generation**: User triggers -> enqueue job -> worker loads context -> run copy and image generation in parallel (Promise.allSettled for graceful degradation) -> update post with results -> mark pending_review. Copy and image can succeed independently.
- **Publishing**: Scheduler polls DB for `status='scheduled' AND scheduled_at<=NOW()` -> for each post: refresh LinkedIn token if needed -> upload image (3-step process: initialize, PUT binary, poll for AVAILABLE status) -> create post via LinkedIn API -> update status to published or failed with retry count.

**Key patterns:**
- Command/query separation: "start generation" returns immediately with job ID; frontend polls separate "get progress" endpoint.
- Idempotent job processing: jobs check if work already done before re-executing; safe to retry.
- Graceful degradation: copy succeeds + image fails = post still goes to review with note.
- Context snapshot: store generation_params JSONB capturing exactly what inputs produced this output (for debugging/reproducibility).

### Critical Pitfalls

**From PITFALLS.md (top 5 for MVP):**

1. **LinkedIn OAuth token expiration (CRITICAL)**: Access tokens expire after 60 days. Programmatic refresh tokens require Marketing Developer Platform (MDP) partner approval, which is NOT self-service. Without MDP approval, users must manually re-authenticate every 60 days—unacceptable for automation. Even with refresh tokens, they expire after 365 days (hard wall, not rolling). **Mitigation**: Apply for MDP partner status immediately. Build token health monitoring from Day 1. Track expires_at for every user. Proactive email/in-app notifications starting 7 days before expiry. Quick "reconnect LinkedIn" flow. Design for graceful handling of sudden token revocation.

2. **AI-generated content sounds generic (CRITICAL)**: Default LLM outputs produce generic LinkedIn platitudes ("In today's fast-paced world..."). Users posting obviously AI-generated content damage their professional reputation and churn. **Mitigation**: Deep onboarding captures industry, expertise, tone preferences, example posts. Scrape user's existing LinkedIn posts if accessible. Multi-stage generation: generate angle -> user approves -> generate full post with angle + voice profile -> user edits. Never auto-publish without review in MVP. Track edit distance between generated and published content as quality signal.

3. **AI image generation is non-deterministic and expensive (CRITICAL)**: Same prompt produces different compositions, styles, colors each time. Brand consistency (matching specific logos, colors, fonts) is unsolved. Text rendering in images is unreliable (typos, garbled characters). At scale, costs compound ($0.04-0.12 per image; 1000 users x 3 posts/week x 2 variations = $240-$720/week). **Mitigation**: Generate 2-3 variations, let users pick. Daily regeneration cap to control costs. Use detailed prompts encoding brand guidelines. Track approval rate (<50% = quality problem). Consider template-based system with dynamic overlays as primary path, AI generation as enhancement.

4. **LinkedIn image upload multi-step process (HIGH)**: Posting with image requires (1) initialize upload -> get URL, (2) PUT binary to URL, (3) use returned URN in post creation. Image processing is asynchronous (WAITING_UPLOAD -> PROCESSING -> AVAILABLE). Using URN before status=AVAILABLE causes post creation to fail silently. **Mitigation**: Poll image status after upload until AVAILABLE (with timeout and backoff). Pre-validate images (format: JPG/PNG/GIF only, <36M pixels). Build image upload status tracker in DB. Retry logic for each step independently. Fallback to text-only if image fails.

5. **LinkedIn API versioning and forced migrations (CRITICAL)**: LinkedIn uses calendar-based versioning (YYYYMM). Older versions are actively sunset. When a version is deprecated, all API calls using that version stop working. The Posts API replaced ugcPosts; Images API replaced Assets API. **Mitigation**: Use latest stable version from Day 1 (`li-lms-2026-01` as of Feb 2026). Abstract LinkedIn API calls behind a versioned service layer. Monitor LinkedIn dev blog for deprecation notices. Plan version migration every 6 months. Always include required headers: `Linkedin-Version: YYYYMM` and `X-Restli-Protocol-Version: 2.0.0`.

**Additional high-severity pitfalls:**
- LinkedIn rate limits are opaque, per-application (all users share quota), and reset at midnight UTC. Spread scheduled posts across time windows.
- LinkedIn's `little` text format has reserved characters (`| { } @ [ ] ( ) < > # \ * _ ~`) that must be escaped. Build sanitizer for all AI output.
- Timezone/DST handling: store user's IANA timezone identifier, convert to UTC at execution time (not scheduling time). Test DST transition dates explicitly.
- Website scraping is fragile (client-side rendering, cookie walls, Cloudflare). Make it a "nice to have" with aggressive 10s timeout and graceful fallback to manual input.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core MVP (Foundation + First Value)
**Rationale:** Get users from signup to seeing their first AI-generated content plan and posts within one session. Everything on the critical path to that "aha moment." No features that aren't dependencies of this flow.

**Delivers:**
- User can sign up, complete onboarding (quick start + deep brief + upload assets)
- AI generates a 2-week content plan with 8-12 post slots
- User can generate individual posts (copy + image) with review/approve/regenerate flow
- User can connect LinkedIn OAuth and schedule posts
- Scheduler publishes approved posts at scheduled times
- User sees content calendar with upcoming/published posts

**Addresses (from FEATURES.md):**
- All table stakes: auth, OAuth, calendar, scheduling, auto-publishing, preview, edit, AI copy/image generation, onboarding
- Tier 1 differentiators: "brief once" deep onboarding, AI image generation, full content strategy generation, brand-informed visual coherence, zero-skill targeting

**Avoids (from PITFALLS.md):**
- Token expiration (build monitoring + re-auth flow from Day 1)
- Generic AI content (deep onboarding captures voice/brand context)
- Image non-determinism (human-in-the-loop review, regenerate button)
- Multi-step image upload failures (polling for AVAILABLE status)
- API versioning (abstraction layer, latest version)
- Rate limits (spread posts, basic tracking)
- `little` text format issues (sanitizer for all output)
- Timezone bugs (store IANA timezone, convert at execution)
- Scraping fragility (graceful fallback to manual)

**Uses (from STACK.md):**
- SvelteKit 2.x + Svelte 5 (web app)
- PostgreSQL via Supabase (database + auth + storage + realtime)
- Drizzle ORM (type-safe queries)
- BullMQ + Redis (job queue)
- Railway (hosting: web + workers + scheduler + Redis)
- Claude Sonnet (content plan + copy generation)
- GPT-4o (asset analysis, fallback)
- Flux 1.1 Pro (primary image gen), DALL-E 3 (fallback)
- Vercel AI SDK (LLM abstraction)
- Tailwind CSS + Bits UI (custom vibrant design, accessibility)
- Sharp (image processing)

**Implements (from ARCHITECTURE.md):**
- Web application (auth, onboarding, calendar, review UI)
- Background workers (plan generation, post generation, asset analysis, URL scraping)
- Scheduler process (60s polling loop with SKIP LOCKED)
- Database schema (all core tables)
- OAuth token management (encrypted storage, refresh logic)
- AI generation pipeline (brand intelligence assembly -> plan generation -> post generation)
- File storage (presigned uploads to Supabase Storage)
- Job progress tracking (polling endpoint for frontend)

**Build order (from ARCHITECTURE.md):**
1. Database schema + auth (foundation)
2. Product CRUD + quick start onboarding
3. File upload + asset management
4. Job queue setup + URL scraping worker (validates pattern)
5. Asset analysis worker (brand intelligence)
6. Deep brief wizard + brand intelligence assembly
7. Content plan generation (LLM, worker, progress UI)
8. Copy + image generation workers (parallel execution)
9. Post preview/review UI (approve/reject/regenerate)
10. LinkedIn OAuth + token management
11. Scheduler process + publishing logic
12. Content calendar + post editing
13. Dashboard overview

### Phase 2: Trust & Efficiency (Post-MVP Enhancements)
**Rationale:** After users have published 10+ posts and built trust, add features that reduce manual effort and increase engagement. Also add revenue model.

**Delivers:**
- Autopilot mode (AI generates + publishes without review, with safety caps)
- Brief completeness score (gamified nudges to improve AI output quality)
- Carousel generation for LinkedIn (multi-slide PDFs, high-engagement format)
- Multi-product support (manage multiple brands from one account)
- Billing integration (Free/Pro/Agency tiers)
- Email notifications (published, failed, weekly digest)
- Improved voice calibration (users rate samples, AI learns)

**Research needed:**
- Carousel generation: LinkedIn PDF upload API specifics, optimal slide layouts for AI generation
- Billing: Stripe integration patterns for usage-based pricing (generation caps per tier)

### Phase 3: Platform Expansion
**Rationale:** After validating core value on LinkedIn, expand to Instagram (different content style, different OAuth flow, Meta App Review required).

**Delivers:**
- Instagram publishing (OAuth via Meta, different image dimensions/formats)
- Platform-specific content adaptation (LinkedIn = professional, Instagram = visual/casual)
- Cross-posting with platform-appropriate variations

**Research needed:**
- Meta App Review requirements and timeline (can take weeks/months)
- Instagram Graph API capabilities and limitations
- Image format/dimension requirements per platform

### Phase 4: Analytics & Optimization
**Rationale:** Once sufficient published content volume exists, add analytics to measure performance and optimize content strategy.

**Delivers:**
- LinkedIn analytics integration (impressions, engagement, clicks)
- AI learning from analytics (adjust content strategy based on what performs)
- A/B testing for post variations
- Performance dashboard and insights

**Research needed:**
- LinkedIn Marketing Developer Platform (MDP) requirements for analytics access
- Which metrics are accessible via API vs. require manual integration

### Phase 5: Advanced Automation
**Rationale:** Push the boundaries of automation once trust and quality are proven.

**Delivers:**
- Reel/video generation (short video content, frontier of AI generation)
- Advanced brand fine-tuning (per-brand style models)
- Team collaboration / approval workflows
- White-label / agency reselling

**Research needed:**
- Video AI generation state-of-art (landscape evolving rapidly)
- LoRA fine-tuning for brand-specific image models

### Phase Ordering Rationale

- **Phase 1 is the critical path**: Everything needed to deliver core value (brief -> plan -> posts -> publish). No nice-to-haves. This phase has the highest execution risk (AI quality, LinkedIn integration, token management).
- **Dependency-driven**: Phase 2 features (autopilot, multi-product) require Phase 1 trust and infrastructure. Phase 3 (Instagram) is independent but deferred due to Meta App Review complexity. Phase 4 (analytics) requires published content volume from Phase 1.
- **Risk sequencing**: The hardest problems (AI image quality, brand coherence, LinkedIn OAuth lifecycle) are tackled in Phase 1 where they can't be avoided. Lower-risk expansions (billing, Instagram) come later.
- **Pitfall avoidance**: Phase 1 architecture (monolith-first, job queue, token monitoring, abstraction layers) is designed to avoid the critical pitfalls upfront. Adding features in later phases doesn't create architectural rework.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 1 (LinkedIn integration)**: Verify current API versions, rate limits, token lifecycle specifics, MDP application process. STACK.md notes this should be done before build.
- **Phase 1 (image generation)**: Hands-on testing of Flux vs. DALL-E 3 vs. alternatives for brand-coherent social images. Prompt engineering for different content types. This is art + science; can't be fully researched, must be iterated.
- **Phase 2 (carousel generation)**: LinkedIn PDF upload API, slide layout best practices, AI-generated multi-slide content patterns.
- **Phase 3 (Instagram)**: Meta App Review requirements, Instagram Graph API capabilities, cross-platform content adaptation strategies.
- **Phase 4 (analytics)**: MDP analytics access requirements, available metrics, data modeling for performance insights.

**Phases with standard patterns (skip deep research):**
- **Phase 1 (auth, database, job queue)**: Well-documented patterns. Supabase Auth, PostgreSQL schema design, BullMQ setup are all established.
- **Phase 2 (billing)**: Stripe integration is well-documented; usage-based pricing patterns are standard.
- **Phase 5 (team workflows)**: Standard multi-tenancy patterns apply.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | SvelteKit vs Next.js rationale is sound. Supabase/PostgreSQL is solid. BullMQ is proven. Specific versions (Svelte 5, Flux 1.1 Pro, Tailwind 4) need verification. AI model recommendations based on May 2025 state-of-art; landscape evolves rapidly. |
| Features | MEDIUM | Competitor analysis (Buffer, Hootsuite, Predis.ai, etc.) is thorough but based on training data. The "no competitor does brief + original images + full strategy" claim is high-confidence for early 2025 but needs manual verification. Feature complexity estimates are sound. |
| Architecture | HIGH | Monolith-first is correct for team size. BullMQ job queue patterns are battle-tested. Database schema is well-designed for relational SaaS data. AI pipeline (plan -> posts, parallel copy/image) is logical. Deployment strategy (Railway for web+workers+scheduler) is appropriate. |
| Pitfalls | HIGH | LinkedIn API pitfalls (token expiry, versioning, rate limits, image upload, `little` format) are verified against official Microsoft/LinkedIn docs dated through Feb 2026. AI generation pitfalls (generic content, non-deterministic images, cost spirals) are well-documented industry challenges. Timezone/DST and web scraping pitfalls are standard engineering issues. |

**Overall confidence:** MEDIUM

Research is comprehensive and architecturally sound, but based on training data through May 2025 with no web verification. Three areas need validation before build:

1. **LinkedIn API specifics**: Current rate limits (not published in docs), MDP application process/timeline, latest API version status. Recommend manual verification.
2. **AI model landscape**: Flux 1.1 Pro was state-of-art for brand-coherent images in early 2025; newer models may exist. DALL-E 3 pricing may have changed. Requires hands-on testing during Phase 1.
3. **Competitor feature sets**: Buffer, Hootsuite, Predis.ai may have added features (especially AI image generation) since early 2025. Quick competitor scan recommended before finalizing positioning.

### Gaps to Address

**Technical gaps:**
- **Image generation model selection**: Needs hands-on comparison during Phase 1 implementation. Flux vs. DALL-E 3 vs. Ideogram vs. any new entrants. Test prompt adherence, brand consistency, cost, API reliability. Budget 1-2 weeks for this.
- **LinkedIn MDP approval timeline**: Unknown. Could be days or months. Apply immediately. Have contingency if approval is slow (launch with personal posts only, add company pages later).
- **Brand style extraction accuracy**: Can vision models reliably extract visual style from uploaded assets? What's the quality floor with poor uploads? Needs implementation spike.

**Product gaps:**
- **Image generation cost at scale**: At $0.04-0.12 per image, costs could be 5-20% of revenue. Unit economics need modeling with actual usage patterns. May need to cap regenerations or tier by generation volume.
- **Content plan repetition avoidance**: How well can LLMs avoid repeating themes across multiple 2-week plans? Needs testing with real brief data and iterative prompt engineering.
- **Voice capture depth vs. onboarding friction**: The deep brief is the moat, but if it feels like a chore, users abandon. UX iteration critical. Consider progressive disclosure: quick start (2 min) -> see first plan -> enhance brief -> regenerate improved plan.

**Integration gaps:**
- **LinkedIn API rate limits**: Not published. Can only discover by making calls and checking Developer Portal. Monitor from Day 1 and adjust scheduling logic based on actual limits encountered.
- **Website scraping success rate**: Will vary widely by site technology. Track by domain type (Wix, Squarespace, custom, etc.) and improve fallback UX for common failure modes.

## Sources

### Primary (HIGH confidence)
- **STACK.md**: Technology selection based on training data through May 2025. Framework comparison (SvelteKit vs Next.js vs Remix), database comparison (PostgreSQL/Supabase vs alternatives), background jobs (BullMQ vs alternatives), AI providers (Claude, GPT-4o, Flux, DALL-E 3), hosting (Railway vs Vercel vs Fly.io). Detailed rationale for each choice. Confidence: MEDIUM (strong technical reasoning, but versions need verification).
- **FEATURES.md**: Competitor analysis (Buffer, Hootsuite, Later, Sprout Social, ContentStudio, SocialBee, Predis.ai, Lately.ai, Jasper, Copy.ai). Feature matrix, table stakes vs. differentiators vs. anti-features. MVP recommendation and phase deferrals. Confidence: MEDIUM (thorough analysis but based on early 2025 competitive landscape).
- **ARCHITECTURE.md**: System design (monolith-first + async jobs), component boundaries, data flows, database schema, AI generation pipeline, deployment architecture. Patterns to follow and anti-patterns to avoid. Build order based on dependencies. Confidence: HIGH (sound architectural principles, well-established patterns).
- **PITFALLS.md**: LinkedIn API pitfalls verified against official Microsoft/LinkedIn documentation (dates: Nov 2025 - Feb 2026). Sources cited: OAuth flow, programmatic refresh tokens, API access tiers, Posts API, Images API, rate limits, `little` text format. AI generation pitfalls (quality, cost, non-determinism) based on industry knowledge. Confidence: HIGH for LinkedIn specifics (verified with official docs), HIGH for AI challenges (well-documented).

### Secondary (MEDIUM confidence)
- Training data knowledge of SaaS architecture patterns, job queue implementations, OAuth best practices, timezone handling, web scraping challenges. Standard engineering domain knowledge. Not project-specific, but applicable.

### Tertiary (LOW confidence)
- Specific pricing for AI APIs (Anthropic, OpenAI, Replicate) as of May 2025. Prices change frequently; these are directional estimates needing verification.
- Flux 1.1 Pro as state-of-art for brand-coherent image generation. AI landscape evolves rapidly; newer/better models may exist as of Feb 2026.
- Railway/Render/Fly.io hosting feature sets and pricing. Platforms evolve; verify current offerings.

---
**Research completed:** 2026-02-15
**Ready for roadmap:** Yes

**Next steps for orchestrator:**
1. Load this SUMMARY.md as context for roadmap creation
2. Use Phase 1-5 suggestions as starting point for roadmap structure
3. Apply research flags to determine which phases need `/gsd:research-phase` during planning
4. Reference STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md for detailed decisions during requirements definition
5. Validate gaps (LinkedIn MDP approval, image model selection, competitor features) during Phase 1 planning
