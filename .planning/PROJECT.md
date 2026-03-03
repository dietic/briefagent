# BriefAgent.ai

## What This Is

An AI-powered marketing agency platform for indie builders and small businesses. Users brief the platform about their product — what it does, who it's for, what their brand looks and sounds like — and the AI generates content strategies, original visual assets, and platform-optimized copy. Users then review, approve, and download the content to publish manually on their social accounts. The tagline is "The AI marketing agency you can brief in 5 minutes."

## Core Value

A user with zero design skills and zero marketing knowledge can brief the AI and get professional, brand-consistent marketing content generated, reviewed, and ready to download — the AI proposes, the human disposes.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Full onboarding flow (Quick Start + Deep Brief + Asset Library)
- [ ] Website auto-scraping with graceful fallback
- [ ] AI content plan generation (2-week strategies)
- [ ] AI copy generation (platform-optimized per channel)
- [ ] AI image generation (fully AI-generated, brand-informed from asset analysis)
- [ ] Content calendar with review/approval workflow
- [ ] Content download/export for manual publishing
- [ ] Full marketing landing page

### Out of Scope

- Real-time chat or messaging — not core to content generation value
- Mobile app — web-first, mobile later
- OAuth login (Google, etc.) — email/password sufficient for v1
- Social account linking / auto-publishing — MVP is manual download, auto-publishing deferred to v2
- Instagram publishing — requires Meta App Review, deferred to v2+
- Billing/payment gating — free access in Phase 1, billing is Phase 3
- Autopilot mode — deferred to Phase 2 to build user trust first
- Carousel and reel generation — deferred to Phase 2
- Multi-product per user — deferred to Phase 2
- Analytics from platform APIs — Phase 4
- AI learning from analytics — Phase 4
- Agency mode / team collaboration — Phase 4
- Relevant upcoming events in content planning — dropped for now

## Context

### Target Audience

- **Primary:** Indie hackers, solo SaaS founders, bootstrapped startups who'd rather build their product than do marketing
- **Secondary:** Small business owners (bakeries, gyms, freelancers, Shopify stores) with no design skills, no marketing knowledge, no agency budget
- **Global from day one**

### Onboarding Flow (Most Critical UX)

The AI's output quality depends entirely on how good the brief is. Progressive onboarding in three steps:

**Step 1 — Quick Start (~2 min):** Product name, website URL, description, logo upload. URL triggers auto-scraping to extract descriptions, colors, key phrases, screenshots — with graceful fallback if scraping fails (show what was extracted, let user correct/fill manually, never block onboarding).

**Step 2 — Deep Brief (~5 min):** Wizard-style flow covering:
- Product details: problem it solves, key features, differentiator, pricing, product stage
- Audience: ideal customer description, industry, age range, pain points, where they hang out online
- Brand voice: personality traits as selectable chips (professional, casual, witty, bold, friendly, technical), example content they admire, words to always/never use
- Goals & preferences: main goal (brand awareness / leads / sales / community), posting frequency, preferred times or let AI optimize

**Step 3 — Asset Library (always accessible):** Upload product screenshots, photos, team photos, lifestyle images, testimonials, branded graphics. Each asset tagged by type, optional description for AI context, can be marked as primary asset.

### AI Content Generation Pipeline

**Stage 1 — Content Plan:** Two-week strategy based on full product brief, all uploaded assets, connected platforms, posting frequency, current date, and summaries of previous plans (to avoid repetition). Includes strategy overview, content themes, and individual post slots. Each slot specifies: date/time, platform, post type (static image, text-only), topic/angle, content category (educational, promotional, social proof, behind-the-scenes, engagement, tips, announcement, storytelling), what it should communicate, which assets to reference, hook/key message. Promotional content capped at 30% of plan. Generated as background job — quality over speed, show progress.

**Stage 2 — Individual Post Generation:** For each post slot, the AI generates:
- **Copy:** Platform-optimized with scroll-stopping hook, value-driven body, goal-aligned CTA, hashtag mix. LinkedIn: longer, professional but human, up to 5 hashtags. Instagram (future): shorter, casual, emoji-friendly, up to 30 hashtags.
- **Image:** Fully AI-generated. The AI analyzes the user's uploaded assets to understand the brand's visual identity (colors, style, aesthetic), then generates original images informed by that understanding — not template fills, not uploads with overlays, but original visuals that feel coherent with the brand.

### Content Calendar & Review

- Monthly and weekly views with color-coded status thumbnails: gray (draft), yellow (pending review), blue (approved), green (scheduled), dark green (published), red (failed)
- Review screen: full platform preview, edit copy (with char counts), swap visual, edit hashtags, change schedule
- Actions: approve, reject with reason, regenerate (separate buttons for copy / image / both), edit and approve

### Content Export (MVP)

- Users download generated content (copy text + images) for manual publishing
- One-click copy-to-clipboard for post text
- Individual image download
- Users can mark posts as "published" manually to track status
- Automated social publishing (LinkedIn, Instagram, etc.) deferred to v2

### Brief Completeness Score (Phase 2)

Dashboard shows percentage score and nudges users to fill in more for better results ("Upload more screenshots for better visual content", "Add testimonials to unlock social proof posts").

### Autopilot Mode (Phase 2)

Toggle per product. When enabled, AI-generated posts skip review and go straight to scheduled. Users can still modify before publish time. New users default to manual, nudged to try autopilot after 10 manually approved posts.

### Phasing

**Phase 1 (MVP):** Auth (email/password with verification), full onboarding flow with website scraping, product brief editor, asset uploads with tagging, AI content plan generation, AI copy generation, AI static image generation, content calendar (monthly/weekly), post review/approval flow with granular regeneration, content download/export for manual publishing, full marketing landing page.

**Phase 2:** Carousel generation, reel/motion graphic generation, autopilot mode, brief completeness score with nudges, inline editing of post copy and visuals, multiple products per user, email notifications (published, failed, weekly digest), custom default prompt for AI generation.

**Phase 3:** Instagram OAuth and publishing, Instagram-specific formats/dimensions, billing integration (free/pro plan gating).

**Phase 4 (future):** Post analytics from platform APIs, AI learning from analytics, more platforms (Twitter/X, TikTok, Facebook), agency mode, team collaboration, content A/B testing, competitor analysis, AI-suggested trending content, white-label.

### Monetization (Post-Billing, Phase 3+)

| Tier | Price | Products | Accounts | Posts/mo | Key Features |
|------|-------|----------|----------|----------|--------------|
| Free | $0 | 1 | 1 | 10 | Manual approval, watermark on images |
| Pro | $19/mo | 3 | 5 | 100 | Autopilot, carousels, reels, no watermark, email notifications |
| Agency | $49/mo | 10 | 20 | Unlimited | Team members (3), approval workflows, analytics, priority support |

Pricing sustainability will be validated against real AI generation costs post-launch.

### Design Direction

Vibrant, creative, energetic — inspired by Gumloop and Relume.io. Bold gradients, strong colors, polished interactions. Not "safe SaaS blue" — this should feel like a creative agency platform. Stand out from typical B2B tools.

**Established Design System (variant-2c):**
- Palette: Cyan (#06b6d4) primary, Orange (#f97316) secondary, Pink (#ec4899) tertiary
- Typography: Bricolage Grotesque (display, weight 200-800) + Fira Code (mono, weight 300-500)
- Dark background: #070b0e, Surface: #0e1519, Surface-alt: #0c1620
- Light background: #f6fcfd, Surface: #ffffff, Surface-alt: #f0f5f7
- Full light/dark theme via CSS variables + mode-watcher
- Glass-morphism navbar, floating geometric shapes, scroll-reveal animations
- Split-color logo: "Brief" (white/dark) + "Agent" (cyan)
- Dashboard variants: 5 approved in `design-variants/dashboard/variant-{1-5}.html`

### Design Principles

1. Everything starts with the brief
2. AI proposes, human disposes — never publish without approval unless autopilot is on
3. Progressive disclosure — don't overwhelm
4. Content should look platform-native, as if made by a social media expert
5. Trust through transparency — users always know what will be posted, when, and where

## Constraints

- **AI Costs:** Image generation + LLM calls per post create per-unit costs. Pricing must account for this. Optimize model selection for cost/quality balance.
- **Social APIs (v2):** LinkedIn/Instagram publishing APIs have rate limits and require OAuth app approval. Deferred to post-MVP to reduce complexity.
- **Image Quality:** AI-generated images must be consistently brand-coherent. This is the hardest technical problem and the core differentiator. If output quality isn't good enough, the value prop falls apart.
- **Website Scraping:** Unreliable by nature — many sites block scrapers. Must never block onboarding.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No social publishing in MVP | Users download content and publish manually; reduces complexity, avoids OAuth/API approval delays | Adopted |
| Fully AI-generated images (not templates) | Higher quality ceiling, true brand-informed generation | — Pending |
| Email/password auth (no OAuth) | Simpler to build, sufficient for v1 | — Pending |
| Tech stack TBD via research | Want best-fit stack, not defaults | — Pending |
| AI providers: best-of-breed mix | Different models excel at different tasks | — Pending |
| Free access in Phase 1, billing in Phase 3 | Validate product-market fit before monetizing | — Pending |
| Events data dropped | Complexity vs value unclear, can add later | — Pending |
| Custom default prompt deferred to Phase 2 | Power-user feature, not critical for launch | — Pending |
| Landing page in Phase 1 (moved from Phase 3) | Need public-facing presence for user acquisition | — Pending |
| Custom design system from scratch | No pre-styled component libraries — use Bits UI (headless) with fully custom styling. Every component handcrafted to match Gumloop/Relume.io vibrant aesthetic | — Pending |
| Use frontend-design skill for all UI work | Ensures high-quality, creative design across all screens | — Pending |
| Variant 2c as design direction | Cyan/Orange/Pink palette with Bricolage Grotesque + Fira Code, dark-first | Adopted |
| Dashboard UI before auth | Build all 5 dashboard views with mock data first (Phase 5 before Phase 2) | Adopted |
| All 5 dashboard variants as views | Overview, Calendar, Editor, Brand/Campaigns, Publishing Hub — all built as SvelteKit pages | Adopted |

---
*Last updated: 2026-02-18 — MVP simplification: no social publishing, users download content manually*
