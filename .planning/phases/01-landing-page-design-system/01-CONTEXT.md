# Phase 1: Landing Page & Design System - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the visual identity and public-facing presence through a vibrant, creative landing page that communicates the product value. Build a reusable design system (color tokens, typography scale, components) that the landing page uses and the entire app will consume. Both light and dark themes. Full i18n support (EN/ES) from day one.

</domain>

<decisions>
## Implementation Decisions

### Internationalization (Hard Requirement)
- Every text element must go through i18n — English and Spanish locales from day one
- This is a cross-cutting rule for ALL phases, starting here
- Landing page content must be fully translated in both EN and ES
- Design system components must support locale-aware content (text expansion, RTL-safe spacing)

### Visual personality
- Mood: Creative, playful, confident, energetic
- References: Gumloop and Relume.io — match their vibrant, bold aesthetic
- Background: Claude's discretion (light/dark/mixed sections), but must support both light and dark themes
- Imagery: Mix of product mockups (hero, how-it-works) with abstract/3D visuals as accents and backgrounds

### Page content & messaging
- Hero angle: Solution-first — lead with what BriefAgent does, not the pain point
- Pricing: "Coming soon" style — show all three tiers (Free, Pro, Agency) but mark everything as free during beta with future pricing shown
- Tagline: Use "The AI marketing agency you can brief in 5 minutes" or a variation of it

### Interaction & motion
- Motion level: Rich animations — the page should feel alive
- Scroll-triggered reveals: Elements animate in as you scroll (staggered cards, text sliding up, images fading in)
- Hover micro-interactions: Buttons that scale/glow, cards that tilt, elements that respond to cursor
- Both scroll reveals AND hover micro-interactions throughout

### Design system scope
- Themes: Both light and dark from Phase 1, built into design tokens and all components
- Responsiveness: Mobile-first approach
- Components: Claude's discretion on scope — balance what the landing page needs with what Phase 2 will need

### Claude's Discretion
- Color palette direction (study Gumloop and Relume.io references, pick what fits)
- Background treatment (dark vs light vs mixed sections)
- How-it-works section format (3-step linear vs visual pipeline)
- Feature count and selection for features section
- Hero section visual treatment (gradient, particles, product demo, or combination)
- Navbar behavior (sticky with blur, auto-hide, etc.)
- Icon set selection (Lucide, Phosphor, or other)
- Component set depth for Phase 1 design system
- Typography choices

</decisions>

<specifics>
## Specific Ideas

- "Inspired by Gumloop and Relume.io" — bold gradients, strong colors, polished interactions
- "Not safe SaaS blue" — this should feel like a creative agency platform
- Custom design system from scratch — Bits UI (headless) with fully custom styling, no pre-styled libraries
- Use frontend-design skill for all UI work to ensure high-quality creative design
- Solution-first hero: visitor immediately understands what BriefAgent does
- Pricing tiers exist in PROJECT.md: Free ($0/1 product/10 posts), Pro ($19/mo), Agency ($49/mo)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-landing-page-design-system*
*Context gathered: 2026-02-15*
