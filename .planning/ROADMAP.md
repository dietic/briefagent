# Roadmap: BriefAgent.ai

## Overview

BriefAgent goes from zero to a fully functional AI marketing agency platform in five phases. Phase 1 established the visual identity and public presence through the landing page (complete). Phase 5 builds the full dashboard UI with all 5 views using mock data. Phase 2 builds the user input pipeline (auth, onboarding, brief, assets, LinkedIn connection). Phase 3 delivers the AI engine. Phase 4 completes the loop with calendar, review/approval, automated publishing, and wires real data into the dashboard.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4, 5): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Landing Page & Design System** - Establish visual identity and public-facing presence *(COMPLETE)*
- [ ] **Phase 5: Dashboard UI** - Build all 5 dashboard views as SvelteKit pages with shared layout and mock data
- [ ] **Phase 2: Auth, Onboarding & LinkedIn** - User journey from signup through completed brief with connected account
- [ ] **Phase 3: AI Generation Pipeline** - Content plan, copy, and image generation from product brief
- [ ] **Phase 4: Calendar, Review & Publishing** - Content calendar, approval workflow, automated LinkedIn publishing, wire real data into dashboard

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

### Phase 5: Dashboard UI
**Goal**: All 5 dashboard views are built as SvelteKit pages under `/dashboard/` with a shared layout (sidebar nav, header), matching the approved design variants. Uses static/mock data — real data integration happens when backend phases are complete.
**Depends on**: Phase 1 (design system)
**Dashboard Views**:
  1. **Overview / Analytics** — KPI cards, performance chart, activity feed, upcoming schedule (variant-1)
  2. **Content Calendar** — Monthly/weekly calendar grid, content chips, AI suggestions, daily queue (variant-2)
  3. **Content Editor** — 3-panel: brief form, AI-generated content preview, variants & history (variant-3)
  4. **Brand & Campaigns** — Brand profile with score, campaign cards, brand voice, content mix chart (variant-4)
  5. **Publishing Hub** — Kanban pipeline (Drafts → Review → Scheduled → Published), AI assistant panel (variant-5)
**Success Criteria** (what must be TRUE):
  1. User can navigate between all 5 dashboard views via the sidebar
  2. Each view renders a polished UI matching its design variant with proper light/dark theme support
  3. Shared layout (sidebar, header, theme toggle) is consistent across all views
  4. All dashboard pages use the same design system tokens as the landing page
  5. Pages work with static/mock data and are ready to be wired to real backends later
**Reference files**: `design-variants/dashboard/variant-{1-5}.html`
**Plans**: 0 plans (run /gsd:plan-phase 5 to break down)

Plans:
- [ ] TBD (run /gsd:plan-phase 5 to break down)

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
Phases execute in dependency order: 1 (done) -> 5 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Landing Page & Design System | 2/2 | Complete | 2026-02-16 |
| 5. Dashboard UI | 0/? | Next up | - |
| 2. Auth, Onboarding & LinkedIn | 0/3 | Not started | - |
| 3. AI Generation Pipeline | 0/2 | Not started | - |
| 4. Calendar, Review & Publishing | 0/3 | Not started | - |
