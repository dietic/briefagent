# Roadmap: BriefAgent.ai

## Overview

BriefAgent goes from zero to a fully functional AI marketing agency platform in four phases. Phase 1 established the visual identity and public presence through the landing page (complete). Phase 5 builds the full dashboard UI with all 5 views using mock data. Phase 2 builds the user input pipeline (auth, onboarding, brief, assets). Phase 3 delivers the AI engine. Phase 4 completes the loop with calendar, review/approval, content download/export, and wires real data into the dashboard. For the MVP, users download generated content and publish manually — automated social publishing is deferred to a future milestone.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4, 5): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Landing Page & Design System** - Establish visual identity and public-facing presence *(COMPLETE)*
- [x] **Phase 5: Dashboard UI** - Build all 5 dashboard views as SvelteKit pages with shared layout and mock data *(COMPLETE)*
- [ ] **Phase 2: Auth & Onboarding** - User journey from signup through completed brief and asset uploads
- [ ] **Phase 3: AI Generation Pipeline** - Content plan, copy, and image generation from product brief
- [x] **Phase 4: Calendar, Review & Export** - Content calendar, approval workflow, content download/export, wire real data into dashboard *(COMPLETE)*

## Phase Details

### Phase 1: Landing Page & Design System *(COMPLETE)*
**Goal**: Visitors see a vibrant, creative landing page that communicates the product value and establishes the design language (color palette, typography, components) used across the entire app
**Depends on**: Nothing (first phase)
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06
**Status**: COMPLETE — Landing page built with hero, features, how-it-works, pricing, CTA, navbar, footer. Design system established: Cyan (#06b6d4) / Orange (#f97316) / Pink (#ec4899) palette, Bricolage Grotesque + Fira Code typography, CSS variable system for light/dark theme, reusable UI components (button, badge, card). i18n with Paraglide (en/es, 106+ keys).
**Plans**: 2 plans (completed outside GSD tracking)

Plans:
- [x] 01-01-PLAN.md -- Design system foundation (SvelteKit scaffold, Tailwind v4 @theme tokens, Paraglide i18n, core UI components)
- [x] 01-02-PLAN.md -- Landing page build (hero, features, how-it-works, pricing, CTA, footer with animations)

### Phase 5: Dashboard UI *(COMPLETE)*
**Goal**: All 5 dashboard views are built as SvelteKit pages under `/dashboard/` with a shared layout (sidebar nav, header), matching the approved design variants. Uses static/mock data — real data integration happens when backend phases are complete.
**Depends on**: Phase 1 (design system)
**Status**: COMPLETE — All 5 dashboard views built: Overview (KPI cards, charts, activity feed), Calendar (month/week grid, chips, AI suggestions), Editor (3-panel brief/preview/history), Brand (radial charts, campaigns, voice traits), Publishing (kanban, AI panel). Shared layout with sidebar nav + header. 15 components, 5 mock data files, 111+ i18n keys. Verified 27/27 must-haves.
**Plans**: 4 plans

Plans:
- [x] 05-01-PLAN.md — Foundation: layout group refactoring, dashboard shell (sidebar + header), CSS variables, i18n chrome keys
- [x] 05-02-PLAN.md — Overview / Analytics page (variant-1): KPI cards, performance chart, activity feed, schedule
- [x] 05-03-PLAN.md — Content Calendar (variant-2) + Brand & Campaigns (variant-4): calendar grid, radial charts, campaigns
- [x] 05-04-PLAN.md — Content Editor (variant-3) + Publishing Hub (variant-5): 3-panel editor, kanban board, AI panel

### Phase 2: Auth & Onboarding
**Goal**: A new user can sign up, complete the full onboarding flow (Quick Start with website scraping, Deep Brief wizard, Asset Library uploads), and have everything the AI needs to generate content
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, ONBR-01, ONBR-02, ONBR-03, ONBR-04, ONBR-05, ONBR-06, ONBR-07, ONBR-08, ASET-01, ASET-02, ASET-03, ASET-04
**Success Criteria** (what must be TRUE):
  1. User can sign up with email/password, receive a verification email, log in, stay logged in across browser refreshes, and log out from any page
  2. User can reset a forgotten password via email link, set a new password, and log in with the new password
  3. User can complete Quick Start (product name, URL, description, logo) and the system auto-scrapes the URL for brand data -- with graceful fallback if scraping fails
  4. User can complete the Deep Brief wizard (product details, audience, brand voice traits/examples/words, goals and posting frequency)
  5. User can upload assets (screenshots, photos, etc.), tag them by type, add descriptions, and mark primary assets
**Wave Structure**: Wave 1 = 02-01 (auth), Wave 2 = 02-02 (onboarding)
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Auth system: Supabase SSR setup, adapter-node, hooks middleware, auth pages (login, signup, forgot-password, reset-password, verify-email, callback), dashboard auth guard, logout
- [ ] 02-02-PLAN.md — Onboarding flow: Drizzle ORM schema, stepper layout, Quick Start with URL scraping, Deep Brief wizard (4 sections), Asset Library with drag-and-drop uploads, dashboard integration

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
**Wave Structure**: Wave 1 = 03-01 (foundation + schema), Wave 2 = 03-02 (plan generation), Wave 3 = 03-03 (post generation)
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — AI foundation: AI SDK install, DB schema extensions (generationJobs, contentPlans, posts tables + enums), AI provider config, brief assembler
- [ ] 03-02-PLAN.md — Content plan generation: Zod schemas, LLM structured output with GPT-4.1, 30% promo cap validation, background job + SSE progress, generate page UI
- [ ] 03-03-PLAN.md — Post generation: brand asset analysis (vision), per-post copy generation, per-post image generation, post orchestrator with batching

### Phase 4: Calendar, Review & Export
**Goal**: The user can view their content on a calendar, review and approve each post with full editing and regeneration controls, download/export approved content (copy text + images) for manual publishing, and see everything tied together in the dashboard
**Depends on**: Phase 3
**Requirements**: CALR-01, CALR-02, CALR-03, REVW-01, REVW-02, REVW-03, REVW-04, REVW-05, REVW-06, REVW-07, REVW-08, REVW-09, REVW-10, REVW-11, EXPT-01, EXPT-02, EXPT-03, DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. User can view their content calendar in monthly and weekly views with color-coded status thumbnails (gray/yellow/blue/green/red)
  2. User can click any post to see a full platform preview, edit copy (with character count), swap the visual, edit hashtags, and change the scheduled date
  3. User can approve, reject (with reason), or regenerate (copy only, image only, or both) any post -- and can edit-and-approve in one action
  4. User can copy post text to clipboard and download generated images for manual publishing
  5. Dashboard shows content stats (generated/approved/pending), upcoming posts, and a button to generate a new content plan
**Wave Structure**: Wave 1 = 04-01 (schema + API + calendar), Wave 2 = 04-02 + 04-03 (parallel: review dialog + dashboard)
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Schema extensions (published status, rejectionReason, publishedAt), PATCH/regenerate API endpoints, calendar page data wiring with month navigation
- [x] 04-02-PLAN.md — Post review dialog (Bits UI) with editing, approval, regeneration, export; wire into calendar + publishing pages with real data
- [x] 04-03-PLAN.md — Dashboard overview wiring: real stats (generated/pending/approved/published), upcoming posts, generate plan CTA

## Progress

**Execution Order:**
Phases execute in dependency order: 1 (done) -> 5 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Landing Page & Design System | 2/2 | Complete | 2026-02-16 |
| 5. Dashboard UI | 4/4 | Complete | 2026-02-16 |
| 2. Auth & Onboarding | 2/2 | Complete (pending checkpoint) | 2026-02-18 |
| 3. AI Generation Pipeline | 3/3 | Complete | 2026-02-19 |
| 4. Calendar, Review & Export | 3/3 | Complete    | 2026-02-19 |
