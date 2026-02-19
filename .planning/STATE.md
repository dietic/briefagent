# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-16)

**Core value:** A user with zero design or marketing skills can brief the AI and get professional, brand-consistent marketing content generated and published to their social accounts.
**Current focus:** Phase 3 - AI Generation Pipeline

## Current Position

Phase: 3 of 4 (AI Generation Pipeline)
Plan: 2 of 3 (03-02 complete)
Status: Executing Phase 3
Last activity: 2026-02-19 — 03-02 Content plan generation pipeline (3 tasks, schemas + API + UI)

Progress: [######----] 67% (03-01 done, 03-02 done, 03-03 pending)

## Performance Metrics

**Velocity:**
- Total plans completed: 10 (Phase 1: 2 + Phase 5: 4 + Phase 2: 2 + Phase 3: 2 of 3)
- Average duration: 6.4min
- Total execution time: 1.07 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-landing-page-design-system | 2/2 | 15min | 7.5min |
| 05-dashboard-ui | 4/4 | 24min | 6min |
| 02-auth-onboarding | 2/2 | 16min | 8min |
| 03-ai-generation-pipeline | 2/3 | 11min | 5.5min |

**Recent Trend:**
- Last 5 plans: 4min, 5min, 6min, 2min, 9min
- Trend: Consistent (~5min)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Landing page is Phase 1 to establish design system before app build
- [Roadmap]: 4 phases — Landing, Dashboard UI, Auth/Onboarding, AI Pipeline, Calendar/Review/Export
- [MVP]: No social account linking or auto-publishing — users download content and publish manually
- [Roadmap]: Dashboard UI (Phase 5) executes after Phase 1, before Phase 2 — frontend-first with mock data
- [Design]: Variant 2c selected as final design direction
- [Design]: Palette changed from hot pink to Cyan (#06b6d4) / Orange (#f97316) / Pink (#ec4899)
- [Design]: Typography: Bricolage Grotesque (display) + Fira Code (mono)
- [Design]: Dark background #070b0e, surface #0e1519, glass-morphism navbar
- [Design]: Split-color logo: "Brief" (white) + "Agent" (cyan)
- [Design]: Full light/dark theme support via CSS variables + mode-watcher
- [Design]: 5 dashboard variants approved — all 5 to be built as SvelteKit pages
- [01-01]: Used Paraglide JS v2 with cookie strategy instead of deprecated @inlang/paraglide-sveltekit adapter
- [01-01]: LanguageSwitcher uses setLocale() cookie-based approach instead of URL-based locale prefixes
- [01-02]: CSS animations over Svelte transitions for hero to prevent SSR hydration flash
- [01-02]: svelte-inview v4 oninview_enter event name for Svelte 5 compatibility
- [01-02]: Tailwind 4 tree-shakes @keyframes not referenced by --animate-* utility classes — use animate-* classes, not inline style="animation:"
- [Landing]: All landing components use CSS variables (--bg-page, --text-main, --text-dim, etc.) for theme support
- [Landing]: Emojis used for icons in hero cards, features, and how-it-works (not Lucide icons)
- [05-01]: Layout groups: (landing) for public pages, /dashboard for app pages
- [05-01]: typeof LayoutDashboard for lucide-svelte icon type (Svelte 5 Component type incompatible)
- [05-01]: Dashboard CSS Grid layout: 240px sidebar + 1fr content
- [05-01]: Dashboard CSS variables extend app.css (not separate file) for theme toggle compat
- [05-03]: RGB channel CSS custom properties (--chip-electric-rgb etc.) for alpha compositing in Svelte style bindings
- [05-03]: Radial chart component with discriminated union props for score vs donut modes
- [05-03]: Calendar grid uses $derived.by() for reactive month/week view switching
- [05-04]: Full-height dashboard pages use h-[calc(100%+4rem)] -m-8 to expand into layout padding
- [05-04]: KanbanColumn uses Svelte 5 Snippet type for typed children composition
- [05-04]: PostCard uses $derived for platform color lookup (Svelte 5 reactivity best practice)
- [05-02]: Explicit i18n label maps instead of dynamic m[key] indexing for type safety with Paraglide
- [05-02]: SVG sparklines and area charts rendered inline (no chart library) for zero extra dependencies
- [05-02]: Dashboard components receive typed props from centralized mock data file
- [05-04]: Mock data pattern: typed interfaces + const exports in src/lib/data/
- [02-research]: Supabase Auth via @supabase/ssr for cookie-based SSR auth
- [02-research]: Drizzle ORM + Supabase PostgreSQL (service role key, application-level auth, not RLS)
- [02-research]: LinkedIn REST API direct integration (Posts API + Images API, Linkedin-Version header)
- [02-research]: Cheerio for URL scraping, Zod for validation, Sharp for image processing
- [02-research]: AES-256-GCM encryption for OAuth tokens at rest
- [02-research]: Always use getUser() on server (not getSession()) for verified auth
- [02-01]: Supabase SSR with createServerClient + getUser() for verified server auth
- [02-01]: sequence() chains Supabase middleware with Paraglide middleware
- [02-01]: adapter-node for server-side capabilities (DB, auth, API routes)
- [02-01]: (auth) layout group with centered card, no navbar/footer
- [02-01]: Forgot-password never reveals if email exists (security)
- [02-01]: Placeholder .env for build (gitignored), .env.example for user setup
- [02-02]: Drizzle relational query API (db.query.X.findFirst) for readable data access
- [02-02]: Asset ownership verified via inner join (assets -> products -> userId)
- [02-02]: Form action ?/finish for onboarding completion (cleaner than custom API)
- [02-02]: Non-blocking URL scraping fires on blur, auto-fills description, graceful fallback
- [02-02]: Tag input pattern: $state array + Enter keydown + X remove for chip inputs
- [03-01]: AI SDK v6 with @ai-sdk/openai for unified text + image provider interface
- [03-01]: gpt-4.1 for strategic planning, gpt-4.1-mini for per-post copy and analysis
- [03-01]: gpt-image-1 for image generation via AI SDK image provider
- [03-01]: Drizzle relations for all 6 tables enabling relational queries throughout the app
- [03-01]: Centralized AI provider config in providers.ts, brief assembler pattern for prompt context
- [03-02]: AI SDK generateObject with Zod schema for type-safe structured output (not generateText + manual parse)
- [03-02]: Fire-and-forget pattern for background generation to return jobId immediately
- [03-02]: SSE streaming with polling fallback for robust progress reporting
- [03-02]: 30% promotional cap with retry + manual reassignment fallback

### Roadmap Evolution

- Phase 5 added: Dashboard UI — all 5 dashboard views as SvelteKit pages
- Phase 5 dependency set to Phase 1 (not Phase 4) — build UI first with mock data
- Phase 1 marked complete retroactively (work done outside GSD tracking)
- Execution order changed: 1 -> 5 -> 2 -> 3 -> 4
- Phase 5 completed: 4 plans, 27/27 must-haves verified
- Phase 2 completed: 2 plans (auth + onboarding), pending human verification
- Phase 3 progress: 03-01 AI foundation + 03-02 content plan generation complete (schemas, API, SSE, generate page)

### Pending Todos

None yet.

### Blockers/Concerns

- AI image model landscape may have shifted since research (May 2025) -- verify Flux/DALL-E options during Phase 3

## Session Continuity

Last session: 2026-02-19
Stopped at: Completed 03-02-PLAN.md (content plan generation pipeline). Next: 03-03 (post copy + image generation)
Resume: Continue /gsd:execute-phase 03 -- 03-03 remains. User needs OPENAI_API_KEY in .env. DB migration needed: pnpm drizzle-kit push.
