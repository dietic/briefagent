---
phase: 01-landing-page-design-system
plan: 01
subsystem: ui
tags: [sveltekit, tailwindcss-v4, oklch, paraglide-js, i18n, design-tokens, mode-watcher, svelte5]

requires:
  - phase: none
    provides: "First plan -- no prior dependencies"
provides:
  - "SvelteKit project scaffold with TypeScript, Tailwind v4, Paraglide i18n"
  - "Complete OKLCH design token system (@theme) with colors, typography, spacing, shadows, animations"
  - "Dark/light theme support via mode-watcher with FOUC prevention"
  - "EN/ES translations for all landing page content (78 keys each)"
  - "7 reusable UI components: Button, Card, Badge, Section, Container, ThemeToggle, LanguageSwitcher"
  - "Animation utilities for scroll-triggered reveals"
  - "Self-hosted fonts: Plus Jakarta Sans (display) + Inter (body)"
affects: [01-02-PLAN, all-future-phases]

tech-stack:
  added: [sveltekit, svelte5, tailwindcss-v4, "@tailwindcss/vite", "@inlang/paraglide-js@2", bits-ui, lucide-svelte, mode-watcher, svelte-inview, "@fontsource/inter", "@fontsource-variable/plus-jakarta-sans"]
  patterns: ["Tailwind @theme CSS-first tokens", "OKLCH color space", "Svelte 5 $props() + Snippet", "Paraglide v2 cookie strategy i18n", "mode-watcher class-based dark mode"]

key-files:
  created:
    - src/lib/styles/theme.css
    - src/app.css
    - src/hooks.server.ts
    - src/hooks.ts
    - messages/en.json
    - messages/es.json
    - src/lib/components/ui/button.svelte
    - src/lib/components/ui/card.svelte
    - src/lib/components/ui/badge.svelte
    - src/lib/components/ui/section.svelte
    - src/lib/components/ui/container.svelte
    - src/lib/components/ui/theme-toggle.svelte
    - src/lib/components/ui/language-switcher.svelte
    - src/lib/utils/animations.ts
  modified:
    - package.json
    - vite.config.ts
    - src/app.html
    - src/routes/+layout.svelte
    - src/routes/+page.svelte

key-decisions:
  - "Used Paraglide JS v2 with cookie strategy instead of deprecated @inlang/paraglide-sveltekit adapter"
  - "LanguageSwitcher uses setLocale() cookie-based approach instead of URL-based locale prefixes"
  - "Set git identity at repo level using values from .gitconfig suggestions"

patterns-established:
  - "Component pattern: Svelte 5 $props() with Snippet children, variant/size props, class override support, rest spread"
  - "i18n pattern: import * as m from '$lib/paraglide/messages.js' then m.key_name()"
  - "Dark mode pattern: Tailwind dark: variant + mode-watcher class toggling"
  - "Design token pattern: @theme in theme.css, @import in app.css, utility classes in components"

duration: 10min
completed: 2026-02-15
---

# Phase 01 Plan 01: Foundation & Design System Summary

**SvelteKit scaffold with Tailwind v4 OKLCH design tokens, Paraglide v2 EN/ES i18n, mode-watcher dark mode, and 7 reusable UI components**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-15T21:00:21Z
- **Completed:** 2026-02-15T21:11:03Z
- **Tasks:** 2
- **Files modified:** 23

## Accomplishments
- Complete OKLCH color system (primary violet-purple, accent orange-coral, neutrals, surfaces, semantics) in Tailwind v4 @theme
- Full EN/ES translations with 78 matched keys covering navigation, hero, features, how-it-works, pricing, CTA, footer, and UI strings
- 7 design system components (Button, Card, Badge, Section, Container, ThemeToggle, LanguageSwitcher) all built with Svelte 5 patterns
- Dark/light theme switching with FOUC prevention via mode-watcher
- Self-hosted Plus Jakarta Sans (display) and Inter (body) fonts via Fontsource
- Demo page exercising all components and i18n in a full landing page layout

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold SvelteKit project with Tailwind v4, Paraglide i18n, and design tokens** - `7fc3981` (feat)
2. **Task 2: Build core UI components and demo page** - `a62d098` (feat)

## Files Created/Modified
- `src/lib/styles/theme.css` - Complete design token system (OKLCH colors, typography, spacing, shadows, animations, easing, breakpoints)
- `src/app.css` - Tailwind import, dark mode custom variant, semantic color mappings
- `src/hooks.server.ts` - Paraglide v2 middleware for i18n locale detection
- `src/hooks.ts` - Paraglide reroute hook for URL delocalization
- `messages/en.json` - English translations (78 keys)
- `messages/es.json` - Spanish translations (78 keys)
- `src/lib/components/ui/button.svelte` - Button with 4 variants (primary/secondary/ghost/outline) and 3 sizes
- `src/lib/components/ui/card.svelte` - Card with default/highlighted variants and hover effects
- `src/lib/components/ui/badge.svelte` - Badge with 4 variants (default/accent/outline/success)
- `src/lib/components/ui/section.svelte` - Section with light/dark/gradient backgrounds
- `src/lib/components/ui/container.svelte` - Responsive max-width container
- `src/lib/components/ui/theme-toggle.svelte` - Dark/light toggle with lucide icons
- `src/lib/components/ui/language-switcher.svelte` - EN/ES locale switcher with cookie strategy
- `src/lib/utils/animations.ts` - Scroll reveal config, stagger delay, reveal class helpers
- `vite.config.ts` - Added Tailwind and Paraglide Vite plugins
- `src/routes/+layout.svelte` - Root layout with ModeWatcher, fonts, and app.css
- `src/routes/+page.svelte` - Demo page exercising all components
- `package.json` - All dependencies added
- `project.inlang/settings.json` - Paraglide config with en/es locales
- `src/app.html` - HTML shell for SvelteKit

## Decisions Made
- **Paraglide JS v2 over deprecated adapter:** The old `@inlang/paraglide-sveltekit` is deprecated. Switched to `@inlang/paraglide-js@^2.0.0` which bundles the Vite plugin and SvelteKit middleware directly. This is the officially recommended approach.
- **Cookie strategy for i18n:** Used Paraglide v2's default cookie-based locale detection instead of URL-prefix strategy. `setLocale()` sets a cookie and reloads the page. Simpler URL structure (no `/es/` prefix).
- **Git identity set at repo level:** Global `.gitconfig` had name/email commented out. Set `user.name` and `user.email` at repository level to unblock commits.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Switched from deprecated @inlang/paraglide-sveltekit to @inlang/paraglide-js v2**
- **Found during:** Task 1 (dependency installation)
- **Issue:** `@inlang/paraglide-sveltekit@0.16.1` is deprecated, prints warnings to use `@inlang/paraglide-js` v2+ directly
- **Fix:** Uninstalled deprecated package, installed `@inlang/paraglide-js@^2.12.0`, configured Vite plugin from `@inlang/paraglide-js` directly
- **Files modified:** package.json, vite.config.ts, src/hooks.server.ts, src/hooks.ts
- **Verification:** npm run build succeeds, i18n messages render correctly
- **Committed in:** 7fc3981 (Task 1 commit)

**2. [Rule 3 - Blocking] Manual setup instead of sv add commands**
- **Found during:** Task 1 (scaffolding)
- **Issue:** `npx sv add tailwindcss` and `npx sv add paraglide` require interactive TTY prompts that fail in non-interactive environment
- **Fix:** Manually configured Tailwind CSS v4 (@tailwindcss/vite plugin in vite.config.ts, app.css imports) and Paraglide JS (project.inlang settings, Vite plugin, hooks files) instead of using sv CLI
- **Files modified:** vite.config.ts, src/app.css, project.inlang/settings.json
- **Verification:** npm run build succeeds, all features work identically
- **Committed in:** 7fc3981 (Task 1 commit)

**3. [Rule 3 - Blocking] Git identity configuration**
- **Found during:** Task 1 (committing)
- **Issue:** Git config had no active user.name/email -- commits failed with "Author identity unknown"
- **Fix:** Set git config user.name and user.email at repository level
- **Files modified:** .git/config (not tracked)
- **Verification:** Commit succeeded
- **Committed in:** N/A (git config, not a tracked file)

**4. [Rule 1 - Bug] LanguageSwitcher adapted for Paraglide v2 cookie strategy**
- **Found during:** Task 2 (LanguageSwitcher component)
- **Issue:** Plan referenced `localizeHref` and `page.url.pathname` for URL-based locale switching, but Paraglide v2 cookie strategy uses `setLocale()` instead
- **Fix:** Built LanguageSwitcher using `setLocale()` which sets cookie and reloads, instead of generating localized href links
- **Files modified:** src/lib/components/ui/language-switcher.svelte
- **Verification:** Locale switching works in dev server
- **Committed in:** a62d098 (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (1 bug, 3 blocking)
**Impact on plan:** All auto-fixes were necessary to work with current Paraglide JS v2 API. No scope creep. Final result matches all plan requirements.

## Issues Encountered
- `npx sv add` commands require interactive TTY which is unavailable in this execution environment. Resolved by manual configuration.
- Paraglide init created `de.json` instead of `es.json` (default template). Resolved by deleting `de.json` and creating `es.json`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All design tokens, components, and i18n infrastructure are ready for Plan 01-02 to compose the full landing page
- Demo page serves as a visual reference for all available components and variants
- The `npm run build` and `npm run dev` both succeed cleanly

## Self-Check: PASSED

All 19 key files verified present. Both task commits (7fc3981, a62d098) verified in git history. SUMMARY.md exists.

---
*Phase: 01-landing-page-design-system*
*Completed: 2026-02-15*
