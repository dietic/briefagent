# Phase 5: Dashboard UI - Research

**Researched:** 2026-02-16
**Domain:** SvelteKit dashboard pages, layout groups, component architecture, mock data patterns
**Confidence:** HIGH

## Summary

This phase converts 5 approved HTML design variants into SvelteKit pages under `/dashboard/`. The core challenge is **architectural**: the dashboard needs a completely different layout from the landing page (sidebar + header instead of full-page navbar + footer), which requires SvelteKit layout groups. Each view has its own unique UI complexity: KPI cards with sparklines, a calendar grid, a 3-panel content editor, brand profile with radial charts, and a kanban board with an AI assistant panel.

The existing codebase uses Svelte 5 runes (`$state`, `$derived`, `$props`), Tailwind CSS 4 with `@theme` directive, Paraglide i18n, `mode-watcher` for theme state, and `lucide-svelte` for icons. The design variants define extensive CSS variable systems for light/dark themes that closely match the existing `app.css` variables (`--bg-page`, `--text-main`, `--c-electric`, etc.). The dashboard CSS variables from the variants need to be reconciled with and mapped to the established theme system.

All 5 variants use consistent sidebar/header patterns with minor variations (variant-3 uses a narrow 60px icon-only sidebar, while the others use 240px sidebars). The planner must decide on a single sidebar style or make it configurable. All variants share identical theme token patterns and typography (Bricolage Grotesque + Fira Code), matching the existing `theme.css`.

**Primary recommendation:** Use SvelteKit layout groups to separate landing and dashboard layouts. Create a shared `+layout.svelte` for `/dashboard/` routes that provides sidebar navigation and header bar. Build reusable dashboard-specific UI components (sidebar, header, stat-card, chart containers). Use static TypeScript data files for mock data to enable easy replacement with real API calls later.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SvelteKit | ^2.50.2 | Framework / routing / layouts | Already in project |
| Svelte | ^5.49.2 | Component framework with runes | Already in project |
| Tailwind CSS | ^4.0.0 | Utility-first CSS via `@tailwindcss/vite` | Already in project |
| lucide-svelte | ^0.500.0 | Icon library (800+ icons) | Already installed, covers all dashboard icons |
| mode-watcher | ^0.5.0 | Theme toggle state (dark/light) | Already handling theme |
| @inlang/paraglide-js | ^2.12.0 | i18n (en/es) | Already in project |
| bits-ui | ^2.0.0 | Headless UI primitives | Already installed (unused so far) |
| svelte-inview | ^4.0.0 | Scroll-triggered animations | Already installed |

### Supporting (No New Dependencies Needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| bits-ui | ^2.0.0 | Dropdown menus, tooltips, tabs | Sidebar nav dropdowns, chart tabs, action menus |
| lucide-svelte | ^0.500.0 | All dashboard icons | Sidebar icons, KPI icons, action buttons, chart icons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-coded SVG charts | chart.js / lightweight-charts | Overkill for static mock data; SVG charts from design variants are already pixel-perfect |
| Custom kanban | svelte-dnd-action | Drag-and-drop is not needed yet (mock data), can add later |
| Custom calendar grid | date-fns | Only need basic date math for calendar; vanilla JS suffices for mock |

**Installation:**
```bash
# No new packages needed - everything is already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── routes/
│   ├── (landing)/              # Layout group for landing page
│   │   ├── +layout.svelte      # Navbar + Footer (moved from root)
│   │   └── +page.svelte        # Landing page (moved from root)
│   ├── dashboard/              # Dashboard routes
│   │   ├── +layout.svelte      # Dashboard layout: sidebar + header
│   │   ├── +page.svelte        # Overview/Analytics (variant-1)
│   │   ├── calendar/
│   │   │   └── +page.svelte    # Content Calendar (variant-2)
│   │   ├── editor/
│   │   │   └── +page.svelte    # Content Editor (variant-3)
│   │   ├── brand/
│   │   │   └── +page.svelte    # Brand & Campaigns (variant-4)
│   │   └── publishing/
│   │       └── +page.svelte    # Publishing Hub (variant-5)
│   └── +layout.svelte          # Root layout: ModeWatcher + app.css only
├── lib/
│   ├── components/
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── sidebar.svelte          # Sidebar navigation
│   │   │   ├── header.svelte           # Top header bar
│   │   │   ├── kpi-card.svelte         # KPI metric card with sparkline
│   │   │   ├── chart-section.svelte    # Chart container with tabs
│   │   │   ├── activity-feed.svelte    # Activity timeline
│   │   │   ├── schedule-card.svelte    # Upcoming schedule card
│   │   │   ├── calendar-grid.svelte    # Monthly/weekly calendar
│   │   │   ├── content-chip.svelte     # Calendar content chip
│   │   │   ├── kanban-column.svelte    # Kanban column container
│   │   │   ├── post-card.svelte        # Kanban post card
│   │   │   ├── ai-panel.svelte         # AI assistant sidebar
│   │   │   ├── stat-card.svelte        # Small stat card
│   │   │   ├── progress-bar.svelte     # Animated progress bar
│   │   │   ├── radial-chart.svelte     # SVG radial/donut chart
│   │   │   └── brand-card.svelte       # Brand profile card
│   │   ├── landing/            # (existing, unchanged)
│   │   └── ui/                 # (existing, unchanged)
│   ├── data/
│   │   ├── mock-overview.ts    # Overview page mock data
│   │   ├── mock-calendar.ts    # Calendar events mock data
│   │   ├── mock-editor.ts      # Content editor mock data
│   │   ├── mock-brand.ts       # Brand & campaigns mock data
│   │   └── mock-publishing.ts  # Publishing hub mock data
│   └── styles/
│       ├── theme.css           # (existing, unchanged)
│       └── dashboard.css       # Dashboard-specific CSS variables & utilities
```

### Pattern 1: Layout Groups for Landing vs Dashboard
**What:** SvelteKit layout groups `(landing)` isolate the landing page layout (navbar + footer) from the dashboard layout (sidebar + header). The root `+layout.svelte` only contains `ModeWatcher` and `app.css`.
**When to use:** When different sections of an app need completely different chrome.
**Example:**
```typescript
// src/routes/+layout.svelte (root - minimal)
<script lang="ts">
  import { ModeWatcher } from 'mode-watcher';
  import '../app.css';
  let { children } = $props();
</script>

<ModeWatcher />
{@render children()}

// src/routes/(landing)/+layout.svelte
<script lang="ts">
  import Navbar from '$lib/components/landing/navbar.svelte';
  import Footer from '$lib/components/landing/footer.svelte';
  let { children } = $props();
</script>

<Navbar />
{@render children()}
<Footer />

// src/routes/dashboard/+layout.svelte
<script lang="ts">
  import Sidebar from '$lib/components/dashboard/sidebar.svelte';
  import Header from '$lib/components/dashboard/header.svelte';
  let { children } = $props();
</script>

<div class="flex h-screen overflow-hidden bg-[var(--bg-page)]">
  <Sidebar />
  <div class="flex flex-1 flex-col min-h-0">
    <Header />
    <main class="flex-1 overflow-y-auto">
      {@render children()}
    </main>
  </div>
</div>
```

### Pattern 2: Typed Mock Data with Future-Ready Structure
**What:** Mock data lives in typed TypeScript files that mirror the shape of future API responses. Each page imports its own data module.
**When to use:** For all dashboard pages in this phase.
**Example:**
```typescript
// src/lib/data/mock-overview.ts
export interface KpiCard {
  label: string;
  value: string;
  unit?: string;
  trend: { direction: 'up' | 'down'; value: string };
  sparkline: number[];
  color: 'electric' | 'secondary' | 'tertiary' | 'positive';
}

export const kpiCards: KpiCard[] = [
  {
    label: 'Total Posts',
    value: '248',
    trend: { direction: 'up', value: '12%' },
    sparkline: [20, 16, 18, 12, 14, 8, 6, 4],
    color: 'electric'
  },
  // ...
];
```

### Pattern 3: Dashboard CSS Variables Extension
**What:** Add dashboard-specific CSS variables (sidebar bg, card shadow, etc.) to `app.css` or a new `dashboard.css` file, extending the existing light/dark theme system.
**When to use:** For variables used by design variants but not yet in `app.css`.
**Example:**
```css
/* Additional dashboard variables in app.css */
:root {
  --bg-sidebar: #edf4f7;
  --bg-sidebar-active: rgba(8, 145, 178, 0.08);
  --bg-sidebar-hover: rgba(0, 0, 0, 0.03);
  --card-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  --positive: #059669;
  --negative: #dc2626;
}

:root:where(.dark, .dark *) {
  --bg-sidebar: #0a0f13;
  --bg-sidebar-active: rgba(6, 182, 212, 0.08);
  --bg-sidebar-hover: rgba(255, 255, 255, 0.03);
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  --positive: #34d399;
  --negative: #f87171;
}
```

### Pattern 4: Active Route Detection for Sidebar
**What:** Use SvelteKit's `$page.url.pathname` to determine active navigation item.
**When to use:** Sidebar component needs to highlight the active page.
**Example:**
```typescript
// src/lib/components/dashboard/sidebar.svelte
<script lang="ts">
  import { page } from '$app/stores';

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/dashboard/calendar', label: 'Calendar', icon: 'Calendar' },
    { href: '/dashboard/editor', label: 'Content', icon: 'PenTool' },
    { href: '/dashboard/brand', label: 'Campaigns', icon: 'Megaphone' },
    { href: '/dashboard/publishing', label: 'Publishing', icon: 'Send' },
  ];

  function isActive(href: string, pathname: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }
</script>
```

### Pattern 5: SVG Charts as Svelte Components
**What:** Convert the inline SVG charts from design variants into reusable Svelte components with reactive data binding. No charting library needed.
**When to use:** For sparklines, area charts, donut charts, radial score charts.
**Example:**
```svelte
<!-- src/lib/components/dashboard/sparkline.svelte -->
<script lang="ts">
  interface Props {
    data: number[];
    color: string;
    width?: number;
    height?: number;
  }

  let { data, color, width = 72, height = 28 }: Props = $props();

  let points = $derived(
    data.map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (v / Math.max(...data)) * height;
      return `${x},${y}`;
    }).join(' ')
  );

  let areaPoints = $derived(
    `0,${height} ${points} ${width},${height}`
  );
</script>

<svg viewBox="0 0 {width} {height}" class="sparkline">
  <polyline fill={color} opacity="0.08" points={areaPoints} />
  <polyline fill="none" stroke={color} stroke-width="1.5"
    stroke-linecap="round" stroke-linejoin="round" {points} />
</svg>
```

### Anti-Patterns to Avoid
- **Mixing landing and dashboard layouts in one file:** The root layout currently includes Navbar+Footer. This MUST be refactored into a layout group before any dashboard work begins.
- **Duplicating theme variables:** The design variants define their own CSS variable sets. Map them to existing `app.css` variables; do NOT create a parallel system.
- **Fat page components:** Each dashboard page file should be a composition of small components, not a monolithic 500-line file.
- **Using Svelte transitions for entry animations:** CSS animations are preferred for SSR compatibility (per existing convention). Use `animation` property with `animation-delay` for staggered reveals.
- **Importing landing-specific components in dashboard:** Keep `landing/` and `dashboard/` component directories fully separate.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Icon system | Custom SVG icons | `lucide-svelte` | Already installed, covers all 50+ icons in design variants |
| Theme toggling | Custom dark mode logic | `mode-watcher` (already set up) | Handles localStorage, system preference, SSR |
| Dropdown menus | Custom dropdown | `bits-ui` Popover/DropdownMenu | Accessibility, keyboard nav, focus trapping |
| Tooltip system | CSS-only tooltips | `bits-ui` Tooltip | Accessible, positioned correctly, handles overflow |
| Calendar date math | Complex date logic | Simple helper functions with `Date` API | Only needed for month grid calculation; no timezone complexity |
| Drag-and-drop kanban | DnD implementation | Skip for now (static layout) | Mock data phase; add `svelte-dnd-action` when backend is ready |
| i18n message functions | Hardcoded strings | Paraglide `* as m` pattern | All user-facing text must be i18n'd per convention |

**Key insight:** This phase is UI-only with mock data. The temptation is to over-engineer interactive behaviors (drag-drop, real-time updates, data fetching). Resist this. Build beautiful static UI that is structurally ready for interactivity later.

## Common Pitfalls

### Pitfall 1: Root Layout Blocks Dashboard Layout
**What goes wrong:** The current root `+layout.svelte` renders Navbar and Footer on every page, including dashboard routes.
**Why it happens:** Dashboard was not considered when the root layout was created.
**How to avoid:** Refactor the root layout FIRST. Move Navbar+Footer into a `(landing)` layout group. The root layout should only have `ModeWatcher`, `app.css` import, and `{@render children()}`.
**Warning signs:** Navbar appearing on dashboard pages; dashboard content squeezed between navbar and footer.

### Pitfall 2: CSS Variable Collision
**What goes wrong:** Design variants use `--bg`, `--surface`, `--electric`, etc. The existing app uses `--bg-page`, `--bg-surface`, `--c-electric`. Using both systems creates inconsistency.
**Why it happens:** Design variants were standalone HTML files with their own variable naming.
**How to avoid:** Create a mapping table. Convert all variant CSS to use the established variable names from `app.css`. Add missing variables (like `--bg-sidebar`, `--positive`, `--negative`) to `app.css` following the existing naming convention.
**Warning signs:** Theme toggle only partially working on dashboard; some elements not responding to light/dark switch.

### Pitfall 3: Inconsistent Sidebar Across Variants
**What goes wrong:** Each variant has a slightly different sidebar implementation (variant-1 uses 240px with emoji icons, variant-2 uses 240px with unicode icons and a right sidebar, variant-3 uses 60px icon-only sidebar, variant-4 uses 260px with SVG icons, variant-5 uses 240px with SVG icons).
**Why it happens:** Variants were designed independently.
**How to avoid:** Build ONE canonical sidebar component. Use variant-5's design as the base (240px, SVG icons from lucide-svelte, nav sections with labels, user pill at bottom). All pages use this same sidebar. The variant-3 (Content Editor) can optionally collapse the sidebar to icon-only mode if desired, but this is optional.
**Warning signs:** Navigation looks different on each page; inconsistent hover/active states.

### Pitfall 4: Landing Page Route Breakage
**What goes wrong:** Moving files into layout groups changes the route structure and breaks the landing page.
**Why it happens:** `(landing)/+page.svelte` still serves `/` but the layout file path changes.
**How to avoid:** Keep the route path the same. `src/routes/(landing)/+page.svelte` still resolves to `/`. Move `+layout.svelte` content (Navbar/Footer) to `(landing)/+layout.svelte`. The root `+layout.svelte` becomes minimal.
**Warning signs:** 404 on homepage; landing page appearing without navbar/footer.

### Pitfall 5: Tailwind 4 Keyframes Not Tree-Shaking
**What goes wrong:** CSS animations defined in `@theme` block get tree-shaken if they are not referenced by a Tailwind utility class.
**Why it happens:** Tailwind 4 only includes `@keyframes` that are referenced by `animate-*` utilities.
**How to avoid:** Either reference animations via `animate-*` classes in HTML, or define dashboard-specific keyframes outside the `@theme` block (in `app.css` or a `dashboard.css` file). The existing `theme.css` already has `--animate-*` custom properties, but new dashboard-specific animations should be added carefully.
**Warning signs:** Animations not playing in production build but working in dev.

### Pitfall 6: Oversized Page Components
**What goes wrong:** Converting a 700-line HTML variant directly into a single Svelte component creates unmaintainable files.
**Why it happens:** Direct 1:1 translation without componentization.
**How to avoid:** Break each page into 5-10 child components. Each section of the design variant becomes its own component. The page file becomes a composition of imports.
**Warning signs:** Any `.svelte` file exceeding 200 lines is a smell for this project.

### Pitfall 7: Missing i18n for Dashboard Text
**What goes wrong:** Dashboard text is hardcoded in English, breaking the i18n convention.
**Why it happens:** Design variants have English text baked in; easy to copy directly.
**How to avoid:** Add all dashboard strings to `messages/en.json` and `messages/es.json` before building components. Use `m.dashboard_*()` pattern. Even for mock data labels, use i18n keys.
**Warning signs:** Any string literal in a `.svelte` template that is not a CSS class or technical value.

## Code Examples

### SvelteKit Layout Group Setup
```typescript
// src/routes/+layout.svelte (new minimal root)
<script lang="ts">
  import { ModeWatcher } from 'mode-watcher';
  import '../app.css';
  let { children } = $props();
</script>

<ModeWatcher />
{@render children()}
```

```typescript
// src/routes/(landing)/+layout.svelte (landing-specific)
<script lang="ts">
  import Navbar from '$lib/components/landing/navbar.svelte';
  import Footer from '$lib/components/landing/footer.svelte';
  let { children } = $props();
</script>

<Navbar />
{@render children()}
<Footer />
```

### Dashboard Layout Component
```svelte
<!-- src/routes/dashboard/+layout.svelte -->
<script lang="ts">
  import Sidebar from '$lib/components/dashboard/sidebar.svelte';
  import DashboardHeader from '$lib/components/dashboard/header.svelte';
  import '$lib/styles/dashboard.css';
  let { children } = $props();
</script>

<div class="flex h-screen overflow-hidden" style="background: var(--bg-page);">
  <Sidebar />
  <div class="flex flex-1 flex-col min-h-0">
    <DashboardHeader />
    <main class="flex-1 overflow-y-auto transition-colors duration-400" style="background: var(--bg-page);">
      {@render children()}
    </main>
  </div>
</div>
```

### Sidebar with Active Route Detection (Svelte 5 runes)
```svelte
<!-- src/lib/components/dashboard/sidebar.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import * as m from '$lib/paraglide/messages.js';
  import {
    LayoutDashboard, Calendar, PenTool,
    Megaphone, Send, Settings, BarChart3
  } from 'lucide-svelte';

  const mainNav = [
    { href: '/dashboard', label: () => m.dash_nav_overview(), icon: LayoutDashboard },
    { href: '/dashboard/calendar', label: () => m.dash_nav_calendar(), icon: Calendar },
    { href: '/dashboard/editor', label: () => m.dash_nav_content(), icon: PenTool },
    { href: '/dashboard/brand', label: () => m.dash_nav_campaigns(), icon: Megaphone },
    { href: '/dashboard/publishing', label: () => m.dash_nav_publishing(), icon: Send },
  ];

  function isActive(href: string): boolean {
    const pathname = $page.url.pathname;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }
</script>

<aside class="w-60 flex flex-col border-r border-[var(--border-subtle)] transition-colors duration-400"
  style="background: var(--bg-sidebar);">

  <!-- Logo -->
  <a href="/" class="flex items-center gap-2.5 px-6 h-16 border-b border-[var(--border-subtle)]">
    <div class="w-7 h-7 rounded-lg bg-[var(--c-electric)] flex items-center justify-center text-white font-extrabold text-xs">B</div>
    <span class="font-extrabold text-[1.15rem] tracking-tight">
      <span style="color: var(--text-main);">Brief</span><span style="color: var(--c-electric);">Agent</span>
    </span>
  </a>

  <!-- Navigation -->
  <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
    {#each mainNav as item}
      <a
        href={item.href}
        class="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-all duration-150
          {isActive(item.href)
            ? 'font-semibold text-[var(--c-electric)] bg-[var(--bg-sidebar-active)]'
            : 'font-normal text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sidebar-hover)]'}"
      >
        <svelte:component this={item.icon} class="w-[18px] h-[18px]" />
        {item.label()}
      </a>
    {/each}
  </nav>

  <!-- User -->
  <div class="px-3 py-3 border-t border-[var(--border-subtle)]">
    <div class="flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-[var(--bg-sidebar-hover)] cursor-pointer transition-colors">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--c-tertiary)] to-[var(--c-secondary)] flex items-center justify-center text-white text-xs font-extrabold">DM</div>
      <div>
        <div class="text-[0.8rem] font-semibold" style="color: var(--text-main);">Diego M.</div>
        <div class="text-[0.65rem] font-mono" style="color: var(--c-electric);">Pro Plan</div>
      </div>
    </div>
  </div>
</aside>
```

### KPI Card Component
```svelte
<!-- src/lib/components/dashboard/kpi-card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    value: string;
    unit?: string;
    trend: { direction: 'up' | 'down'; value: string };
    sparklineData: number[];
    accentColor: string;
    children?: Snippet;
  }

  let { label, value, unit, trend, sparklineData, accentColor }: Props = $props();

  // Generate sparkline points
  let points = $derived(() => {
    const w = 72, h = 28;
    const max = Math.max(...sparklineData);
    return sparklineData.map((v, i) => {
      const x = (i / (sparklineData.length - 1)) * w;
      const y = h - (v / max) * (h - 4);
      return `${x},${y}`;
    }).join(' ');
  });
</script>

<div class="group rounded-[14px] border border-[var(--border-subtle)] p-5 transition-all duration-300
  hover:border-[var(--border-hover)] hover:-translate-y-0.5 cursor-default relative overflow-hidden"
  style="background: var(--bg-surface);">

  <!-- Top accent line on hover -->
  <div class="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
    style="background: {accentColor};"></div>

  <div class="flex items-center justify-between mb-3">
    <span class="text-xs" style="color: var(--text-dim);">{label}</span>
  </div>

  <div class="text-[1.85rem] font-extrabold tracking-tight leading-none mb-2" style="color: var(--text-main);">
    {value}{#if unit}<span class="text-sm font-normal" style="color: var(--text-dim);">{unit}</span>{/if}
  </div>

  <div class="flex items-center justify-between">
    <span class="inline-flex items-center gap-1 text-[0.7rem] font-bold rounded-md px-2 py-0.5
      {trend.direction === 'up' ? 'text-[var(--positive)] bg-[var(--positive)]/10' : 'text-[var(--negative)] bg-[var(--negative)]/10'}">
      {trend.direction === 'up' ? '\u25B2' : '\u25BC'} {trend.value}
    </span>
    <svg viewBox="0 0 72 28" class="w-[72px] h-7">
      <polyline fill={accentColor} opacity="0.08"
        points="0,28 {points()} 72,28" />
      <polyline fill="none" stroke={accentColor} stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round"
        points={points()} />
    </svg>
  </div>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Svelte 4 `export let` props | Svelte 5 `$props()` rune | Svelte 5 (2024) | All components MUST use `$props()`, not `export let` |
| Svelte 4 `$:` reactivity | Svelte 5 `$derived`, `$state` | Svelte 5 (2024) | Use runes for all reactive state |
| `#each` with `{@const}` | `$derived` computed values | Svelte 5 (2024) | Prefer `$derived` for computed data |
| Svelte transitions `in:fly` | CSS animations (`@keyframes`) | Project convention | CSS animations are preferred for SSR compat |
| Tailwind 3 `tailwind.config.js` | Tailwind 4 `@theme` directive | Tailwind 4 (2024) | Config is in CSS, not JS. Use `@theme` for tokens |
| SvelteKit `data-sveltekit-*` | Standard SvelteKit routing | SvelteKit 2 | Layout groups with `(groupName)` syntax |

**Deprecated/outdated:**
- `export let` for props: Use `$props()` rune instead
- `$:` reactive declarations: Use `$derived()` and `$state()` instead
- `on:click` event handlers: Use `onclick` attribute instead (Svelte 5)
- Svelte `transition:` directives for page-load animations: Use CSS animations per project convention

## Design Variant Analysis

### Sidebar Styles Across Variants
| Variant | Sidebar Width | Icon Style | Nav Sections | Right Panel |
|---------|---------------|------------|--------------|-------------|
| 1 (Overview) | 240px | Unicode emoji | Main, Analytics, System | None |
| 2 (Calendar) | 240px | Unicode emoji | Main, Channels, Tools | 320px daily queue |
| 3 (Editor) | 60px | SVG icons | Icon-only with tooltips | 280px variants panel |
| 4 (Brand) | 260px | SVG icons | Main, AI Tools, Settings | None |
| 5 (Publishing) | 240px | SVG icons | Main, Channels, Settings | 300px AI assistant |

**Recommendation:** Standardize on a 240px sidebar with SVG icons (lucide-svelte). Use variant-5's sidebar design as the canonical template. The nav items should be consistent across all pages. Pages that need a right sidebar (calendar, editor, publishing) integrate it within their own page component, not the shared layout.

### CSS Variables Mapping
| Design Variant Variable | Existing app.css Variable | Action |
|-------------------------|---------------------------|--------|
| `--bg` | `--bg-page` | Map to existing |
| `--surface` | `--bg-surface` | Map to existing |
| `--surface-alt` | `--bg-surface-alt` | Map to existing |
| `--electric` | `--c-electric` | Map to existing |
| `--secondary` | `--c-secondary` | Map to existing |
| `--tertiary` | `--c-tertiary` | Map to existing |
| `--text` | `--text-main` | Map to existing |
| `--text-dim` | `--text-dim` | Already exists |
| `--text-muted` | *missing* | Add to app.css |
| `--border` | `--border-subtle` | Map to existing |
| `--border-hover` | `--border-hover` | Already exists |
| `--sidebar-bg` | `--bg-sidebar` | Add to app.css |
| `--sidebar-active` | `--bg-sidebar-active` | Add to app.css |
| `--toggle-bg` | `--toggle-bg` | Already exists |
| `--positive` / `--negative` | *missing* | Add to app.css |
| `--card-shadow` | *missing* | Add to app.css |
| `--scrollbar-thumb` | *missing* | Add to app.css |
| `--electric-glow` | `--c-electric-glow` | Map to existing |

## Open Questions

1. **Sidebar consistency vs variant fidelity**
   - What we know: Variant-3 (editor) uses a 60px icon-only sidebar while all others use 240px
   - What's unclear: Should the editor view have a collapsible sidebar or always use the standard 240px?
   - Recommendation: Use standard 240px sidebar for ALL pages. The editor already has a 3-panel layout that will work fine with 240px sidebar. The 60px sidebar was a design exploration, not a requirement.

2. **How many i18n keys are needed?**
   - What we know: ~5 nav items, ~5 page titles, ~20-30 UI labels per page, plus mock data labels
   - What's unclear: Should mock data content (post titles, activity descriptions) be i18n'd?
   - Recommendation: i18n all structural UI text (nav items, section headers, button labels, empty states). Mock data content can remain English-only since it will be replaced by real data later. Estimate ~80-100 new i18n keys total.

3. **Dashboard-specific CSS file vs extending app.css**
   - What we know: Need ~15 new CSS variables for dashboard. Also need dashboard-specific keyframe animations.
   - What's unclear: Whether to put everything in app.css or create a separate dashboard.css
   - Recommendation: Add new CSS variables to `app.css` (they are theme-global). Create `src/lib/styles/dashboard.css` for dashboard-specific animations and utility classes, imported only in the dashboard layout.

4. **SVG charts: inline vs component**
   - What we know: Variants use inline SVG for all charts (sparklines, area charts, donut charts, radial progress)
   - What's unclear: Level of interactivity needed in charts (tooltips, hover states)
   - Recommendation: Build charts as Svelte components with typed data props. Keep them simple SVG with CSS transitions. No charting library needed. Interactive tooltips can be added later with bits-ui.

## Sources

### Primary (HIGH confidence)
- **Existing codebase inspection** - Direct analysis of all files in `src/`, `design-variants/dashboard/`, `app.css`, `theme.css`, `package.json`
- **Design variants (5 HTML files)** - `design-variants/dashboard/variant-{1-5}.html` - Pixel-perfect references with complete CSS and JS
- **SvelteKit routing docs** - Layout groups documented in SvelteKit official docs, verified by project's existing SvelteKit 2 usage
- **Svelte 5 runes** - Verified by existing component patterns in codebase (`$state`, `$props`, `$derived` usage)

### Secondary (MEDIUM confidence)
- **Tailwind CSS 4 @keyframes tree-shaking** - Noted as prior decision in phase context; behavior consistent with Tailwind 4 documentation
- **mode-watcher integration** - Working implementation in existing `+layout.svelte` and `theme-toggle.svelte`
- **bits-ui v2** - Installed in package.json but unused; API is headless component primitives for Svelte 5

### Tertiary (LOW confidence)
- None - all findings are based on direct codebase analysis and design variant inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and verified in package.json
- Architecture: HIGH - SvelteKit layout groups are a core framework feature; patterns derived from existing codebase conventions
- Pitfalls: HIGH - Identified from direct analysis of current layout structure and CSS variable mismatches
- Design fidelity: HIGH - All 5 HTML design variants fully analyzed with CSS variable mapping complete

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (stable tech stack, no breaking changes expected)
