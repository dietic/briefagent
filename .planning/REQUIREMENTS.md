# Requirements: BriefAgent.ai

**Defined:** 2026-02-15
**Core Value:** A user with zero design or marketing skills can brief the AI and get professional, brand-consistent marketing content generated, reviewed, and ready to download for manual publishing.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User receives email verification after signup
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: User session persists across browser refresh
- [ ] **AUTH-05**: User can log out from any page

### Onboarding

- [ ] **ONBR-01**: User can enter product name, website URL, and description in Quick Start
- [ ] **ONBR-02**: User can upload product logo during Quick Start
- [ ] **ONBR-03**: System auto-scrapes website URL to extract descriptions, colors, key phrases (with graceful fallback if scraping fails)
- [ ] **ONBR-04**: User can complete Deep Brief wizard covering product details (problem, features, differentiator, pricing, stage)
- [ ] **ONBR-05**: User can specify audience info (ideal customer, industry, age range, pain points, where they hang out)
- [ ] **ONBR-06**: User can select brand personality traits as chips (professional, casual, witty, bold, friendly, technical)
- [ ] **ONBR-07**: User can provide example content they admire and words to always/never use
- [ ] **ONBR-08**: User can set main goal (brand awareness / leads / sales / community) and posting frequency

### Asset Library

- [ ] **ASET-01**: User can upload files (product screenshots, photos, team photos, lifestyle images, testimonials, branded graphics)
- [ ] **ASET-02**: Each uploaded asset is tagged by type
- [ ] **ASET-03**: User can add description to each asset to help AI understand what it shows
- [ ] **ASET-04**: User can mark assets as primary (AI prioritizes these in generation)

### Content Export

- [ ] **EXPT-01**: User can copy approved post text to clipboard with one click
- [ ] **EXPT-02**: User can download generated images individually
- [ ] **EXPT-03**: User can mark a post as "published" manually after uploading it themselves

### Content Plan Generation

- [x] **PLAN-01**: User can generate a 2-week content plan based on their full product brief
- [x] **PLAN-02**: Content plan includes strategy overview, content themes, and individual post slots
- [x] **PLAN-03**: Each post slot specifies date/time, platform, post type (static image or text-only), topic/angle, content category, key message, and which assets to reference
- [x] **PLAN-04**: Content categories include educational, promotional, social proof, behind-the-scenes, engagement, tips, announcement, and storytelling
- [ ] **PLAN-05**: Promotional content never exceeds 30% of the plan
- [x] **PLAN-06**: Plan generation considers summaries of previous plans to avoid repetition
- [ ] **PLAN-07**: User sees progress indicator during plan generation (background job)

### AI Copy Generation

- [ ] **COPY-01**: AI generates platform-optimized copy for each post slot
- [ ] **COPY-02**: Copy includes scroll-stopping hook in first line, value-driven body, and goal-aligned CTA
- [ ] **COPY-03**: LinkedIn copy is longer, professional but human, with up to 5 hashtags
- [ ] **COPY-04**: Hashtags mix popular and niche tags relevant to the user's industry

### AI Image Generation

- [ ] **IMGN-01**: AI analyzes user's uploaded assets to understand brand visual identity (colors, style, aesthetic)
- [ ] **IMGN-02**: AI generates original images informed by brand analysis — not templates, not stock photos with overlays
- [ ] **IMGN-03**: Generated images are visually coherent with the user's brand
- [ ] **IMGN-04**: Images are optimized for LinkedIn post dimensions

### Content Calendar

- [ ] **CALR-01**: User can view content calendar in monthly view
- [ ] **CALR-02**: User can view content calendar in weekly view
- [ ] **CALR-03**: Posts displayed as thumbnails color-coded by status (gray=draft, yellow=pending review, blue=approved, green=scheduled, dark green=published, red=failed)

### Post Review & Approval

- [ ] **REVW-01**: User can click any post to see full preview of how it will look on the platform
- [ ] **REVW-02**: User can edit post copy with character count display
- [ ] **REVW-03**: User can swap the visual asset
- [ ] **REVW-04**: User can edit hashtags
- [ ] **REVW-05**: User can change the scheduled time
- [ ] **REVW-06**: User can approve a post (status becomes scheduled)
- [ ] **REVW-07**: User can reject a post with a reason
- [ ] **REVW-08**: User can regenerate copy only via separate button
- [ ] **REVW-09**: User can regenerate image only via separate button
- [ ] **REVW-10**: User can regenerate both copy and image
- [ ] **REVW-11**: User can edit and approve in one action

### Dashboard

- [ ] **DASH-01**: Dashboard shows upcoming posts for the next 7 days
- [ ] **DASH-02**: Dashboard shows quick stats (posts generated, approved, pending review)
- [ ] **DASH-03**: Dashboard has button to generate a new content plan

### Landing Page

- [ ] **LAND-01**: Public landing page with hero section explaining the product and tagline
- [ ] **LAND-02**: Features section showcasing key capabilities
- [ ] **LAND-03**: How it works section with visual step-by-step flow
- [ ] **LAND-04**: Pricing preview section showing free/pro/agency tiers
- [ ] **LAND-05**: Call-to-action for signup
- [ ] **LAND-06**: Vibrant, creative design inspired by Gumloop and Relume.io

## v2 Requirements

Deferred to future releases. Tracked but not in current roadmap.

### LinkedIn Integration (v2)

- **LINK-01**: User can connect LinkedIn personal profile via OAuth
- **LINK-02**: User can connect LinkedIn company page via OAuth
- **LINK-03**: User can choose per product whether to post to personal profile or company page
- **LINK-04**: System encrypts and manages OAuth tokens with refresh logic

### Automated Publishing (v2)

- **PUBL-01**: Approved posts automatically publish at their scheduled time
- **PUBL-02**: System checks every minute for posts whose scheduled time has arrived
- **PUBL-03**: On successful publish, system stores the live post URL
- **PUBL-04**: On failure, system retries up to 3 times with backoff
- **PUBL-05**: Failed posts surface errors clearly in the dashboard
- **PUBL-06**: System supports LinkedIn text + single image posts

### Carousels (Phase 2)

- **CARO-01**: AI generates multi-slide carousel posts with narrative flow across slides

### Reels (Phase 2)

- **REEL-01**: AI generates short motion graphic videos with animated text, zoom/pan effects, transitions, and background music

### Autopilot (Phase 2)

- **AUTO-01**: User can enable autopilot mode per product (AI posts skip review)
- **AUTO-02**: Users can still modify autopilot posts before publish time
- **AUTO-03**: New users nudged to try autopilot after 10 manually approved posts

### Brief Completeness (Phase 2)

- **BREF-01**: Dashboard shows brief completeness percentage score
- **BREF-02**: System shows contextual nudges to improve brief for better results

### Multi-Product (Phase 2)

- **MULT-01**: User can manage multiple products from one account

### Notifications (Phase 2)

- **NOTF-01**: Email notification when post is published
- **NOTF-02**: Email notification when post fails
- **NOTF-03**: Weekly digest email

### Custom Prompt (Phase 2)

- **CUST-01**: User can set custom default prompt appended to all AI generation

### Inline Editing (Phase 2)

- **INLN-01**: User can edit post copy inline on the calendar
- **INLN-02**: User can edit visuals inline on the calendar

### Instagram (Phase 3)

- **INST-01**: User can connect Instagram account via Meta OAuth
- **INST-02**: System publishes to Instagram with platform-specific formatting
- **INST-03**: Instagram carousel and reel publishing

### Billing (Phase 3)

- **BILL-01**: Free tier with limits (1 product, 1 account, 10 posts/month, watermark)
- **BILL-02**: Pro tier at $19/month with expanded limits
- **BILL-03**: Agency tier at $49/month with team features

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Social listening / monitoring | Enterprise territory ($249+ tools), not core to content generation |
| CRM / customer management | Different product category, users have HubSpot etc. |
| Inbox / DM management | Different product, doubles surface area |
| Built-in design editor (Canva-style) | Contradicts core value — AI generates, users approve/regenerate |
| Stock photo library | Contradicts "AI handles everything" approach |
| Content recycling / evergreen reposting | Feels spammy, detectable by algorithms — AI generates fresh content |
| Blog / long-form content | Different workflow, different quality bar |
| Mobile native app | Responsive web sufficient for approval workflow |
| Link shortening / UTM tracking | Low value, integrate Bitly later if needed |
| Platform-specific advanced features (polls, articles, newsletters) | Each adds API complexity for marginal value |
| White-label / agency reselling | Complex multi-tenancy, validate demand first |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| ONBR-01 | Phase 2 | Pending |
| ONBR-02 | Phase 2 | Pending |
| ONBR-03 | Phase 2 | Pending |
| ONBR-04 | Phase 2 | Pending |
| ONBR-05 | Phase 2 | Pending |
| ONBR-06 | Phase 2 | Pending |
| ONBR-07 | Phase 2 | Pending |
| ONBR-08 | Phase 2 | Pending |
| ASET-01 | Phase 2 | Pending |
| ASET-02 | Phase 2 | Pending |
| ASET-03 | Phase 2 | Pending |
| ASET-04 | Phase 2 | Pending |
| EXPT-01 | Phase 4 | Pending |
| EXPT-02 | Phase 4 | Pending |
| EXPT-03 | Phase 4 | Pending |
| PLAN-01 | Phase 3 | Complete |
| PLAN-02 | Phase 3 | Complete |
| PLAN-03 | Phase 3 | Complete |
| PLAN-04 | Phase 3 | Complete |
| PLAN-05 | Phase 3 | Pending |
| PLAN-06 | Phase 3 | Complete |
| PLAN-07 | Phase 3 | Pending |
| COPY-01 | Phase 3 | Pending |
| COPY-02 | Phase 3 | Pending |
| COPY-03 | Phase 3 | Pending |
| COPY-04 | Phase 3 | Pending |
| IMGN-01 | Phase 3 | Pending |
| IMGN-02 | Phase 3 | Pending |
| IMGN-03 | Phase 3 | Pending |
| IMGN-04 | Phase 3 | Pending |
| CALR-01 | Phase 4 | Pending |
| CALR-02 | Phase 4 | Pending |
| CALR-03 | Phase 4 | Pending |
| REVW-01 | Phase 4 | Pending |
| REVW-02 | Phase 4 | Pending |
| REVW-03 | Phase 4 | Pending |
| REVW-04 | Phase 4 | Pending |
| REVW-05 | Phase 4 | Pending |
| REVW-06 | Phase 4 | Pending |
| REVW-07 | Phase 4 | Pending |
| REVW-08 | Phase 4 | Pending |
| REVW-09 | Phase 4 | Pending |
| REVW-10 | Phase 4 | Pending |
| REVW-11 | Phase 4 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| LAND-01 | Phase 1 | Pending |
| LAND-02 | Phase 1 | Pending |
| LAND-03 | Phase 1 | Pending |
| LAND-04 | Phase 1 | Pending |
| LAND-05 | Phase 1 | Pending |
| LAND-06 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 55 total (10 moved to v2: LINK-01–04, PUBL-01–06; 3 added: EXPT-01–03)
- Mapped to phases: 55
- Unmapped: 0

---
*Requirements defined: 2026-02-15*
*Last updated: 2026-02-18 — MVP simplification: LinkedIn + auto-publishing moved to v2, content export added*
