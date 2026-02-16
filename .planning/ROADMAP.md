# Roadmap: BriefAgent.ai

## Overview

BriefAgent goes from zero to a fully functional AI marketing agency platform in four phases. Phase 1 establishes the visual identity and public presence through the landing page. Phase 2 builds the complete user input pipeline (auth, onboarding, brief, assets, LinkedIn connection). Phase 3 delivers the AI engine that transforms briefs into content plans, copy, and images. Phase 4 completes the loop with the calendar, review/approval workflow, automated publishing, and dashboard.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Landing Page & Design System** - Establish visual identity and public-facing presence
- [ ] **Phase 2: Auth, Onboarding & LinkedIn** - User journey from signup through completed brief with connected account
- [ ] **Phase 3: AI Generation Pipeline** - Content plan, copy, and image generation from product brief
- [ ] **Phase 4: Calendar, Review & Publishing** - Content calendar, approval workflow, automated LinkedIn publishing, and dashboard

## Phase Details

### Phase 1: Landing Page & Design System
**Goal**: Visitors see a vibrant, creative landing page that communicates the product value and establishes the design language (color palette, typography, components) used across the entire app
**Depends on**: Nothing (first phase)
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06
**Success Criteria** (what must be TRUE):
  1. A visitor landing on briefagent.ai sees a hero section with product explanation and tagline, a features section, a how-it-works visual flow, and pricing tiers
  2. The page has a clear call-to-action that leads to signup
  3. The design is vibrant and creative (bold gradients, strong colors, polished interactions) -- not generic SaaS blue
  4. A reusable design system (color tokens, typography scale, button/card/layout components) exists and is used by the landing page, ready for the app to consume
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md -- Design system foundation (SvelteKit scaffold, Tailwind v4 @theme tokens, Paraglide i18n, core UI components)
- [ ] 01-02-PLAN.md -- Landing page build (hero, features, how-it-works, pricing, CTA, footer with animations)

### Phase 2: Auth, Onboarding & LinkedIn
**Goal**: A new user can sign up, complete the full onboarding flow (Quick Start with website scraping, Deep Brief wizard, Asset Library uploads), connect their LinkedIn account, and have everything the AI needs to generate content
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, ONBR-01, ONBR-02, ONBR-03, ONBR-04, ONBR-05, ONBR-06, ONBR-07, ONBR-08, ASET-01, ASET-02, ASET-03, ASET-04, LINK-01, LINK-02, LINK-03, LINK-04
**Success Criteria** (what must be TRUE):
  1. User can sign up with email/password, receive a verification email, log in, stay logged in across browser refreshes, and log out from any page
  2. User can reset a forgotten password via email link
  3. User can complete Quick Start (product name, URL, description, logo) and the system auto-scrapes the URL for brand data -- with graceful fallback if scraping fails
  4. User can complete the Deep Brief wizard (product details, audience, brand voice traits/examples/words, goals and posting frequency)
  5. User can upload assets (screenshots, photos, etc.), tag them by type, add descriptions, and mark primary assets
  6. User can connect a LinkedIn personal profile or company page via OAuth, and the system securely manages tokens with refresh logic
**Plans**: 3 plans

Plans:
- [ ] 02-01: Auth system (signup, verification, login, sessions, password reset, logout)
- [ ] 02-02: Onboarding flow (Quick Start with URL scraping, Deep Brief wizard, Asset Library)
- [ ] 02-03: LinkedIn OAuth integration (personal profile, company page, token management)

### Phase 3: AI Generation Pipeline
**Goal**: The user can generate a full 2-week content plan from their brief, then generate platform-optimized copy and brand-coherent original images for each post slot
**Depends on**: Phase 2
**Requirements**: PLAN-01, PLAN-02, PLAN-03, PLAN-04, PLAN-05, PLAN-06, PLAN-07, COPY-01, COPY-02, COPY-03, COPY-04, IMGN-01, IMGN-02, IMGN-03, IMGN-04
**Success Criteria** (what must be TRUE):
  1. User can trigger content plan generation and see a progress indicator while it runs as a background job
  2. The generated plan contains a strategy overview, content themes, and 8-12 post slots -- each with date/time, platform, post type, topic, content category, key message, and asset references -- with promotional content capped at 30%
  3. Subsequent plans avoid repeating themes from previous plans
  4. For each post slot, AI generates LinkedIn-optimized copy with a scroll-stopping hook, value-driven body, goal-aligned CTA, and a mix of popular/niche hashtags (up to 5)
  5. For each post slot, AI generates an original image informed by analysis of the user's uploaded brand assets -- visually coherent with the brand, optimized for LinkedIn dimensions
**Plans**: 2 plans

Plans:
- [ ] 03-01: Content plan generation (brief assembly, LLM strategy generation, post slot creation, progress tracking)
- [ ] 03-02: Post generation (copy generation, brand asset analysis, image generation, parallel execution)

### Phase 4: Calendar, Review & Publishing
**Goal**: The user can view their content on a calendar, review and approve each post with full editing and regeneration controls, and have approved posts automatically publish to LinkedIn on schedule -- with a dashboard tying everything together
**Depends on**: Phase 3
**Requirements**: CALR-01, CALR-02, CALR-03, REVW-01, REVW-02, REVW-03, REVW-04, REVW-05, REVW-06, REVW-07, REVW-08, REVW-09, REVW-10, REVW-11, PUBL-01, PUBL-02, PUBL-03, PUBL-04, PUBL-05, PUBL-06, DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. User can view their content calendar in monthly and weekly views with color-coded status thumbnails (gray/yellow/blue/green/dark green/red)
  2. User can click any post to see a full platform preview, edit copy (with character count), swap the visual, edit hashtags, and change the scheduled time
  3. User can approve, reject (with reason), or regenerate (copy only, image only, or both) any post -- and can edit-and-approve in one action
  4. Approved posts automatically publish to LinkedIn (text + image) at their scheduled time, with retry logic on failure (up to 3 retries) and the live post URL stored on success
  5. Failed posts surface errors clearly in the dashboard, and the dashboard shows upcoming scheduled posts, quick stats (generated/published/pending), and a button to generate a new content plan
**Plans**: 3 plans

Plans:
- [ ] 04-01: Content calendar (monthly/weekly views, status indicators, post thumbnails)
- [ ] 04-02: Post review and approval workflow (preview, editing, approve/reject/regenerate actions)
- [ ] 04-03: Publishing engine and dashboard (scheduler, LinkedIn API publishing, retry logic, dashboard overview)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Landing Page & Design System | 0/2 | Not started | - |
| 2. Auth, Onboarding & LinkedIn | 0/3 | Not started | - |
| 3. AI Generation Pipeline | 0/2 | Not started | - |
| 4. Calendar, Review & Publishing | 0/3 | Not started | - |
