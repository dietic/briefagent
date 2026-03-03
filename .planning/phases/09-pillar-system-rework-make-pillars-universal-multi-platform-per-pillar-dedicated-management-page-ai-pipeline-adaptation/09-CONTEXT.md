# Phase 9: Pillar System Rework - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning
**Source:** Direct discussion with user

<domain>
## Phase Boundary

Rework the content pillar system to make pillars universal across all product types, support multiple platforms per pillar (many-to-many), add a dedicated pillar management page, and update the AI pipeline to generate platform-adapted content per pillar.

</domain>

<decisions>
## Implementation Decisions

### Pillar Universality
- Pillars available for ALL product types (personal_brand, product, service), not just personal_brand
- Remove the conditional rendering that hides pillars for non-personal_brand types
- Keep 5-pillar limit per product (strategic constraint, not technical)

### Pillar Schema
- Pillar model: name + description + platforms[] (NO separate tone field)
- Tone is derived from platform specs + pillar description (AI interprets tone from context)
- Many-to-many relationship: one pillar can target multiple platforms
- Schema change: add pillar_platforms junction table, remove single `platform` column from contentPillars

### Content Generation Strategy
- One content idea per pillar, adapted separately per platform
- AI generates SEPARATE posts per platform for each pillar (not cross-posting same text)
- Platform specs handle format constraints (char limits, hashtags, thread structure)
- Pillar description carries implicit tone that AI blends with platform guidelines

### Pillar Management UI
- Dedicated `/dashboard/pillars` page (NOT inside /dashboard/brand — pillars are strategy, brand is identity)
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

</decisions>

<specifics>
## Specific Ideas

- User example: Personal brand "Diego" with pillar "Personal CFO" linked to LinkedIn + other networks, and pillar "Personal Journey" linked to LinkedIn showing process from laid off to new job
- The pillar description does double duty — it describes the theme AND carries implicit tone for the AI
- A simple textarea for description is more powerful than dropdowns or predefined tone options
- The AI prompt should explicitly instruct adaptation of pillar theme to each platform's native communication style

</specifics>

<deferred>
## Deferred Ideas

- Pillar analytics/performance tracking per platform
- AI-suggested pillar names based on product type (beyond current pre-suggestions)
- Pillar templates or presets

</deferred>

---

*Phase: 09-pillar-system-rework*
*Context gathered: 2026-03-02 via direct discussion*
