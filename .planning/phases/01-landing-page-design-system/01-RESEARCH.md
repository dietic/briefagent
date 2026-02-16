# Phase 1: Landing Page & Design System - Research

**Researched:** 2026-02-15
**Domain:** Design system foundations (Tailwind CSS v4, Bits UI), SvelteKit landing page, i18n, animations
**Confidence:** HIGH

## Summary

Phase 1 establishes BriefAgent's visual identity through a vibrant, creative landing page and a reusable design system. The technical domain is well-understood: SvelteKit provides the framework, Tailwind CSS v4's `@theme` directive provides CSS-first design tokens with automatic utility class generation, Bits UI v2 provides 40+ accessible headless Svelte 5 primitives, and Paraglide JS (SvelteKit's official i18n integration) provides compile-time type-safe translations with tree-shakable output.

The design direction is locked: Gumloop and Relume.io-inspired aesthetics with bold gradients, strong colors, and polished interactions. Gumloop uses a sophisticated light/dark mode system with entrance animations, carousel effects, blur transitions, and cursor simulations. Relume.io centers on a primary purple (#6248FF), clean whites, off-white surfaces (#F1F0EE), and GSAP-powered parallax and layout animations. Both sites use mixed dark/light sections, which aligns with the user's discretion area. The color direction should lean toward a vibrant purple/violet primary with warm accent gradients (orange-to-purple), using OKLCH color space for perceptually uniform gradients that Tailwind CSS v4 uses natively.

For animations, a layered approach is recommended: Svelte's built-in transitions (fade, fly, slide, scale, blur) for element enter/exit, svelte-inview (Intersection Observer action, Svelte 5 compatible) for scroll-triggered reveals, and CSS keyframe animations defined in Tailwind's `@theme` for micro-interactions (hover glows, button scales, card tilts). This avoids heavy JavaScript animation libraries while achieving rich motion.

**Primary recommendation:** Build the design system as a Tailwind CSS v4 `@theme` file with OKLCH color tokens for both light and dark themes, Inter + a display font for typography, Bits UI for accessible component primitives, and Paraglide JS for EN/ES i18n from day one. Use Svelte's built-in transitions + svelte-inview for scroll animations + CSS keyframes for hover micro-interactions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Internationalization (Hard Requirement):** Every text element must go through i18n -- English and Spanish locales from day one. This is a cross-cutting rule for ALL phases, starting here. Landing page content must be fully translated in both EN and ES. Design system components must support locale-aware content (text expansion, RTL-safe spacing).
- **Visual personality:** Mood is creative, playful, confident, energetic. References are Gumloop and Relume.io -- match their vibrant, bold aesthetic. Background is Claude's discretion (light/dark/mixed sections), but must support both light and dark themes. Imagery is a mix of product mockups (hero, how-it-works) with abstract/3D visuals as accents and backgrounds.
- **Page content & messaging:** Hero angle is solution-first -- lead with what BriefAgent does, not the pain point. Pricing is "Coming soon" style -- show all three tiers (Free, Pro, Agency) but mark everything as free during beta with future pricing shown. Tagline: Use "The AI marketing agency you can brief in 5 minutes" or a variation of it.
- **Interaction & motion:** Motion level is rich animations -- the page should feel alive. Scroll-triggered reveals: elements animate in as you scroll (staggered cards, text sliding up, images fading in). Hover micro-interactions: buttons that scale/glow, cards that tilt, elements that respond to cursor. Both scroll reveals AND hover micro-interactions throughout.
- **Design system scope:** Themes: both light and dark from Phase 1, built into design tokens and all components. Responsiveness: mobile-first approach. Components: Claude's discretion on scope -- balance what the landing page needs with what Phase 2 will need.

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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SvelteKit | 2.x (latest) | Full-stack framework | Already decided in STACK.md; `sv create` scaffolds with TypeScript + Tailwind in one step |
| Svelte | 5.x (latest) | UI framework | Runes reactivity ($state, $derived, $effect) for interactive components |
| Tailwind CSS | 4.x (latest) | Utility-first CSS + design tokens | `@theme` directive provides CSS-first design token system with automatic utility class generation; OKLCH colors natively |
| @tailwindcss/vite | 4.x | Vite plugin for Tailwind | Required for Tailwind CSS v4 integration with SvelteKit's Vite build |
| Bits UI | 2.15.x (latest) | Headless Svelte 5 components | 40+ accessible primitives (Dialog, Dropdown, Tabs, Accordion, Navigation Menu, Tooltip, etc.) with zero styling -- full control over vibrant aesthetic |
| Paraglide JS | 2.x (via `sv add paraglide`) | i18n (EN/ES) | SvelteKit's official i18n integration; compile-time type-safe message functions; tree-shakable; up to 70% smaller bundles than runtime i18n |
| Lucide Svelte | 0.564.x (latest) | Icon set | 1500+ clean, consistent SVG icons; tree-shakable; Svelte 5 compatible; each icon is a reactive component |
| mode-watcher | latest | Dark/light theme management | Manages `.dark` class on `<html>`, localStorage persistence, system preference detection, FOUC prevention |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| svelte-inview | 4.0.4 | Intersection Observer action | Scroll-triggered reveal animations; monitors element viewport entry/exit |
| @fontsource/inter | latest | Self-hosted Inter font | Body typography; avoids Google Fonts CDN dependency; better privacy and performance |
| @fontsource/plus-jakarta-sans | latest | Self-hosted display font | Headings and display text; geometric sans-serif with personality |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| svelte-inview | svelte-motion (Framer Motion port) | svelte-motion is heavier (full animation engine); overkill when Svelte's built-in transitions + CSS keyframes handle micro-interactions well. svelte-inview is lightweight (just Intersection Observer). |
| svelte-inview | Motion (motion.dev) vanilla JS | Motion is React/Vue-focused; Svelte support is experimental. Built-in Svelte transitions are more idiomatic. |
| Paraglide JS | svelte-i18n | svelte-i18n is runtime-based (larger bundle, async loading). Paraglide compiles to static functions -- better for landing page performance and type safety. Paraglide is officially recommended by Svelte. |
| Lucide | Phosphor Icons | Phosphor has more icon variants (6 weights) but is heavier. Lucide is more widely used in the Svelte ecosystem (shadcn-svelte uses it). Both are good; Lucide wins on ecosystem alignment. |
| mode-watcher | Custom theme script | mode-watcher handles edge cases (FOUC prevention, system preference sync, SSR compatibility) that a custom script would need to solve from scratch. Maintained by the svecosystem team (same maintainers as Bits UI). |
| @fontsource/inter | Google Fonts CDN | Self-hosting avoids external CDN dependency, improves privacy, and enables font preloading in SvelteKit's `app.html`. |

**Installation:**
```bash
# Create SvelteKit project
npx sv create briefagent
# Select: SvelteKit minimal, TypeScript, Prettier, ESLint

# Add integrations via sv CLI
npx sv add tailwindcss
npx sv add paraglide  # specify languageTags: en,es

# Core dependencies
npm install bits-ui lucide-svelte mode-watcher svelte-inview

# Fonts (self-hosted)
npm install @fontsource/inter @fontsource-variable/plus-jakarta-sans

# Tailwind (if not added by sv)
npm install tailwindcss @tailwindcss/vite
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app.css                      # Tailwind import + @theme design tokens
├── app.html                     # HTML shell with font preload, lang=%lang%
├── hooks.server.ts              # Paraglide middleware for i18n
├── hooks.ts                     # Paraglide reroute for localized URLs
├── lib/
│   ├── paraglide/               # Generated by Paraglide (messages, runtime)
│   ├── components/
│   │   ├── ui/                  # Design system components (Button, Card, etc.)
│   │   │   ├── button.svelte
│   │   │   ├── card.svelte
│   │   │   ├── badge.svelte
│   │   │   ├── section.svelte
│   │   │   ├── container.svelte
│   │   │   └── ...
│   │   └── landing/             # Landing page-specific composed sections
│   │       ├── hero.svelte
│   │       ├── features.svelte
│   │       ├── how-it-works.svelte
│   │       ├── pricing.svelte
│   │       ├── cta.svelte
│   │       ├── navbar.svelte
│   │       └── footer.svelte
│   ├── styles/
│   │   └── theme.css            # Design system @theme tokens (imported by app.css)
│   └── utils/
│       └── animations.ts        # Shared animation configs for svelte-inview
├── routes/
│   ├── +layout.svelte           # Root layout: imports app.css, ModeWatcher, nav/footer
│   ├── +page.svelte             # Landing page (composes hero, features, how-it-works, pricing, CTA)
│   └── (app)/                   # Future: authenticated app routes (Phase 2+)
└── messages/
    ├── en.json                  # English translations
    └── es.json                  # Spanish translations
```

### Pattern 1: Tailwind CSS v4 Design Token Architecture

**What:** Define all design tokens (colors, typography, spacing, animations) using Tailwind's `@theme` directive in CSS. Tokens become both utility classes AND CSS custom properties automatically.

**When to use:** All design tokens for the entire application.

**Example:**
```css
/* src/lib/styles/theme.css */
@theme {
  /* === RESET DEFAULTS === */
  --color-*: initial;
  --font-*: initial;

  /* === COLORS (OKLCH for perceptually uniform gradients) === */

  /* Primary: Vibrant violet-purple (inspired by Relume #6248FF) */
  --color-primary-50: oklch(0.97 0.02 285);
  --color-primary-100: oklch(0.93 0.04 285);
  --color-primary-200: oklch(0.86 0.08 285);
  --color-primary-300: oklch(0.76 0.14 285);
  --color-primary-400: oklch(0.66 0.20 280);
  --color-primary-500: oklch(0.55 0.25 275);
  --color-primary-600: oklch(0.48 0.27 270);
  --color-primary-700: oklch(0.40 0.24 270);
  --color-primary-800: oklch(0.33 0.19 270);
  --color-primary-900: oklch(0.27 0.14 270);
  --color-primary-950: oklch(0.20 0.10 270);

  /* Accent: Warm orange-coral for energy (Gumloop-inspired warmth) */
  --color-accent-400: oklch(0.78 0.16 55);
  --color-accent-500: oklch(0.70 0.19 45);
  --color-accent-600: oklch(0.62 0.21 38);

  /* Neutral: Clean grays for text and backgrounds */
  --color-neutral-50: oklch(0.98 0.00 0);
  --color-neutral-100: oklch(0.96 0.00 0);
  --color-neutral-200: oklch(0.92 0.00 0);
  --color-neutral-300: oklch(0.87 0.00 0);
  --color-neutral-400: oklch(0.71 0.00 0);
  --color-neutral-500: oklch(0.55 0.00 0);
  --color-neutral-600: oklch(0.44 0.00 0);
  --color-neutral-700: oklch(0.37 0.00 0);
  --color-neutral-800: oklch(0.27 0.00 0);
  --color-neutral-900: oklch(0.20 0.00 0);
  --color-neutral-950: oklch(0.13 0.00 0);

  /* Surface colors for themed backgrounds */
  --color-surface-light: oklch(0.99 0.00 0);
  --color-surface-dark: oklch(0.13 0.02 275);
  --color-surface-muted-light: oklch(0.96 0.005 275);
  --color-surface-muted-dark: oklch(0.17 0.02 275);

  /* Semantic */
  --color-success: oklch(0.72 0.19 145);
  --color-warning: oklch(0.80 0.16 80);
  --color-error: oklch(0.63 0.22 25);
  --color-info: oklch(0.65 0.15 245);

  --color-white: #ffffff;
  --color-black: #000000;

  /* === TYPOGRAPHY === */
  --font-display: 'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body: 'Inter', 'Inter Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  --text-6xl: 3.75rem;
  --text-7xl: 4.5rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  --leading-tight: 1.15;
  --leading-snug: 1.3;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;

  /* === SPACING (4px base) === */
  --spacing: 0.25rem;

  /* === BORDERS === */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* === SHADOWS === */
  --shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1);
  --shadow-glow: 0 0 20px oklch(0.55 0.25 275 / 0.3);
  --shadow-glow-lg: 0 0 40px oklch(0.55 0.25 275 / 0.4);

  /* === ANIMATIONS === */
  --animate-fade-in: fade-in 0.6s ease-out;
  --animate-fade-in-up: fade-in-up 0.6s ease-out;
  --animate-fade-in-down: fade-in-down 0.6s ease-out;
  --animate-slide-in-left: slide-in-left 0.6s ease-out;
  --animate-slide-in-right: slide-in-right 0.6s ease-out;
  --animate-scale-in: scale-in 0.4s ease-out;
  --animate-float: float 6s ease-in-out infinite;
  --animate-pulse-glow: pulse-glow 2s ease-in-out infinite;
  --animate-gradient-shift: gradient-shift 8s ease infinite;

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in-down {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide-in-left {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px oklch(0.55 0.25 275 / 0.2); }
    50% { box-shadow: 0 0 40px oklch(0.55 0.25 275 / 0.5); }
  }
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* === EASING === */
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);

  /* === BREAKPOINTS === */
  --breakpoint-sm: 40rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
  --breakpoint-xl: 80rem;
  --breakpoint-2xl: 96rem;
}
```

```css
/* src/app.css */
@import "tailwindcss";
@import "./lib/styles/theme.css";

/* Class-based dark mode (for mode-watcher) */
@custom-variant dark (&:where(.dark, .dark *));

/* Semantic color mapping via CSS custom properties */
:root {
  --bg-primary: var(--color-surface-light);
  --bg-muted: var(--color-surface-muted-light);
  --text-primary: var(--color-neutral-900);
  --text-secondary: var(--color-neutral-600);
  --text-muted: var(--color-neutral-400);
  --border-default: var(--color-neutral-200);
}

:root:where(.dark, .dark *) {
  --bg-primary: var(--color-surface-dark);
  --bg-muted: var(--color-surface-muted-dark);
  --text-primary: var(--color-neutral-50);
  --text-secondary: var(--color-neutral-300);
  --text-muted: var(--color-neutral-500);
  --border-default: var(--color-neutral-800);
}
```

### Pattern 2: Paraglide i18n Setup for EN/ES

**What:** Type-safe, compile-time i18n with localized routing.

**When to use:** Every text element on the landing page and in all components.

**Example:**
```json
// messages/en.json
{
  "hero_tagline": "The AI marketing agency you can brief in 5 minutes",
  "hero_description": "Brief your product once. Get professional content strategies, original visuals, and platform-optimized copy — generated and published automatically.",
  "hero_cta": "Get started free",
  "nav_features": "Features",
  "nav_pricing": "Pricing",
  "nav_how_it_works": "How it works",
  "pricing_free_title": "Free",
  "pricing_free_price": "$0",
  "pricing_free_description": "Perfect for getting started",
  "pricing_pro_title": "Pro",
  "pricing_pro_price": "$19/mo",
  "pricing_agency_title": "Agency",
  "pricing_agency_price": "$49/mo",
  "pricing_beta_badge": "Free during beta",
  "pricing_coming_soon": "Coming soon"
}
```

```json
// messages/es.json
{
  "hero_tagline": "La agencia de marketing con IA que puedes briefear en 5 minutos",
  "hero_description": "Describe tu producto una vez. Obtiene estrategias de contenido profesionales, visuales originales y copy optimizado para cada plataforma, generado y publicado automaticamente.",
  "hero_cta": "Empieza gratis",
  "nav_features": "Funciones",
  "nav_pricing": "Precios",
  "nav_how_it_works": "Como funciona",
  "pricing_free_title": "Gratis",
  "pricing_free_price": "$0",
  "pricing_free_description": "Perfecto para empezar",
  "pricing_pro_title": "Pro",
  "pricing_pro_price": "$19/mes",
  "pricing_agency_title": "Agencia",
  "pricing_agency_price": "$49/mes",
  "pricing_beta_badge": "Gratis durante la beta",
  "pricing_coming_soon": "Proximamente"
}
```

```svelte
<!-- Usage in components -->
<script lang="ts">
  import { m } from '$lib/paraglide/messages.js';
</script>

<h1 class="text-5xl font-display font-extrabold leading-tight tracking-tight">
  {m.hero_tagline()}
</h1>
```

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';

const paraglideHandle: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
    event.request = localizedRequest;
    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%lang%', locale)
    });
  });

export const handle: Handle = paraglideHandle;
```

```typescript
// src/hooks.ts
import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '$lib/paraglide/runtime';

export const reroute: Reroute = (request) => {
  return deLocalizeUrl(request.url).pathname;
};
```

### Pattern 3: Scroll-Triggered Reveal Animations

**What:** Elements animate in when they enter the viewport using svelte-inview + Svelte transitions + CSS animation classes.

**When to use:** Feature cards, how-it-works steps, pricing cards, any content below the fold.

**Example:**
```svelte
<script lang="ts">
  import { inview } from 'svelte-inview';
  import { fly, fade } from 'svelte/transition';

  let isVisible = $state(false);
</script>

<!-- Approach 1: CSS class-based (for staggered groups) -->
<div
  use:inview={{ rootMargin: '-100px' }}
  oninview={() => isVisible = true}
  class="transition-all duration-700 ease-out {isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-8'}"
>
  <slot />
</div>

<!-- Approach 2: Svelte transitions (for individual elements) -->
{#if isVisible}
  <div
    in:fly={{ y: 30, duration: 600, delay: 200 }}
    use:inview={{ rootMargin: '-50px' }}
    oninview={() => isVisible = true}
  >
    Content reveals on scroll
  </div>
{/if}
```

```svelte
<!-- Staggered card reveal pattern -->
<script lang="ts">
  import { inview } from 'svelte-inview';

  let sectionVisible = $state(false);
</script>

<section
  use:inview={{ rootMargin: '-100px' }}
  oninview={() => sectionVisible = true}
  class="grid grid-cols-1 md:grid-cols-3 gap-6"
>
  {#each features as feature, i}
    <div
      class="transition-all duration-600 ease-out
        {sectionVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'}"
      style="transition-delay: {i * 150}ms"
    >
      <!-- Card content -->
    </div>
  {/each}
</section>
```

### Pattern 4: Hover Micro-Interactions with CSS

**What:** Pure CSS hover effects for buttons, cards, and interactive elements. No JavaScript animation library needed.

**When to use:** All interactive elements -- buttons, cards, links, nav items.

**Example:**
```svelte
<!-- Button with scale + glow on hover -->
<button
  class="
    px-6 py-3 rounded-xl font-semibold
    bg-primary-500 text-white
    transition-all duration-300 ease-spring
    hover:scale-105 hover:shadow-glow
    active:scale-95
  "
>
  {m.hero_cta()}
</button>

<!-- Card with tilt effect using CSS perspective -->
<div
  class="
    group rounded-2xl p-6
    bg-white dark:bg-neutral-900
    border border-neutral-200 dark:border-neutral-800
    transition-all duration-300 ease-out
    hover:shadow-xl hover:-translate-y-1
    hover:border-primary-300 dark:hover:border-primary-700
  "
>
  <div class="transition-transform duration-300 group-hover:scale-[1.02]">
    <!-- Card content -->
  </div>
</div>
```

### Pattern 5: Component Architecture for Design System

**What:** Wrap Bits UI headless primitives with custom styling to create reusable design system components.

**When to use:** Every UI component that will be reused across the landing page and future app.

**Example:**
```svelte
<!-- src/lib/components/ui/button.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    children: Snippet;
    class?: string;
    [key: string]: unknown;
  }

  let {
    variant = 'primary',
    size = 'md',
    href,
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-spring hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';

  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-glow',
    secondary: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700',
    ghost: 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
</script>

{#if href}
  <a {href} class="{baseClasses} {variants[variant]} {sizes[size]} {className}" {...rest}>
    {@render children()}
  </a>
{:else}
  <button class="{baseClasses} {variants[variant]} {sizes[size]} {className}" {...rest}>
    {@render children()}
  </button>
{/if}
```

### Pattern 6: Dark/Light Theme with mode-watcher

**What:** Class-based dark mode managed by mode-watcher with FOUC prevention.

**When to use:** Root layout -- wraps entire application.

**Example:**
```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { ModeWatcher } from 'mode-watcher';
  import '../app.css';
  import '@fontsource/inter/400.css';
  import '@fontsource/inter/500.css';
  import '@fontsource/inter/600.css';
  import '@fontsource/inter/700.css';
  import '@fontsource-variable/plus-jakarta-sans';

  let { children } = $props();
</script>

<ModeWatcher />
{@render children()}
```

```svelte
<!-- Theme toggle component -->
<script>
  import { toggleMode, mode } from 'mode-watcher';
  import { Sun, Moon } from 'lucide-svelte';
</script>

<button
  onclick={toggleMode}
  class="p-2 rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
  aria-label="Toggle theme"
>
  {#if $mode === 'dark'}
    <Sun class="w-5 h-5" />
  {:else}
    <Moon class="w-5 h-5" />
  {/if}
</button>
```

### Anti-Patterns to Avoid

- **Heavy JS animation libraries for simple reveals:** Do not import Framer Motion, GSAP, or anime.js when CSS transitions + svelte-inview achieves the same scroll reveals with near-zero bundle cost. Reserve JS animation libraries for truly complex orchestrations (which this landing page does not need).

- **Runtime i18n libraries:** Do not use `svelte-i18n` or other runtime i18n that loads translation files asynchronously. Paraglide compiles translations into static function calls -- zero async waterfalls, type-safe, tree-shakable.

- **Hardcoded text strings:** Every visible text element must go through Paraglide message functions. No exceptions. This includes alt text, aria-labels, meta tags, and placeholder text.

- **Duplicating dark mode values:** Do not maintain separate color scales for light and dark. Use CSS custom properties (`:root` / `.dark`) for semantic color mappings that reference the same `@theme` tokens.

- **Using shadcn-svelte as-is:** The project explicitly requires custom styling from scratch using Bits UI headless primitives. Do not install shadcn-svelte or copy its default styles. Build all styling from the custom `@theme` tokens.

- **Neglecting text expansion for i18n:** Spanish text is typically 15-30% longer than English. Design components with flexible widths. Never use fixed pixel widths for text containers.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible dialogs/modals | Custom modal with focus trap | Bits UI Dialog | Focus trapping, keyboard navigation, aria attributes, portal rendering are all edge-case-heavy |
| Dropdown menus | Custom dropdown with click-outside | Bits UI Dropdown Menu | Positioning, nested menus, keyboard navigation, screen reader support |
| Dark mode management | Custom theme script with localStorage | mode-watcher | FOUC prevention, SSR compatibility, system preference sync, class management on `<html>` |
| i18n routing | Custom locale detection middleware | Paraglide SvelteKit adapter | URL-based locale detection, reroute hooks, language-aware link generation |
| Intersection Observer | Custom `onMount` + IntersectionObserver | svelte-inview action | Cleanup, multiple observers, threshold configuration, SSR safety |
| Icon rendering | Custom SVG imports or icon sprites | Lucide Svelte | Tree-shaking, consistent sizing, reactive props, TypeScript types |
| Design tokens | CSS custom properties manually | Tailwind @theme | Automatic utility class generation, namespaced organization, shareable across projects |

**Key insight:** The landing page's complexity is in visual design and motion, not in component behavior. Headless primitives (Bits UI) handle the hard behavioral problems (accessibility, keyboard navigation, focus management). Our effort goes into custom styling and animation -- the parts that make BriefAgent look distinctive.

## Common Pitfalls

### Pitfall 1: Flash of Unstyled Content (FOUC) with Dark Mode

**What goes wrong:** Page loads with light theme, then flashes to dark when JavaScript executes and applies the `.dark` class.
**Why it happens:** SvelteKit SSR renders HTML before client-side JS runs. If the dark class is only added by client JS, there's a visible flash.
**How to avoid:** mode-watcher handles this with an inline `<script>` in `<head>` that runs before paint. The component adds a blocking script that reads localStorage and applies `.dark` before the browser renders.
**Warning signs:** Any visible color flash when loading in dark mode.

### Pitfall 2: Tailwind v4 @theme Overriding vs Extending

**What goes wrong:** Using `--color-*: initial` removes ALL default colors, including black and white. Forgetting to define essential colors breaks basic utilities.
**Why it happens:** `@theme { --color-*: initial }` clears the entire color namespace. If you use this to start fresh, you must redefine every color you need.
**How to avoid:** When clearing a namespace, always immediately redefine essential values (white, black, and all your custom colors). Verify utility classes still work after clearing namespaces.
**Warning signs:** `bg-white` or `text-black` not working after customizing theme.

### Pitfall 3: Spanish Text Overflow in Fixed-Width Components

**What goes wrong:** UI components designed for English text break when Spanish translations are 15-30% longer. Buttons overflow, headings wrap unexpectedly, cards become uneven heights.
**Why it happens:** Designing pixel-perfect layouts against English text without testing other locales.
**How to avoid:** Use flexible layouts (flex, grid with `auto-fit`). Set `min-width` instead of `width`. Test with Spanish translations during development, not after. Use `truncate` or `line-clamp` as safety nets where appropriate.
**Warning signs:** Any component with a fixed pixel width containing translated text.

### Pitfall 4: Svelte Transitions on SSR-Rendered Elements

**What goes wrong:** Using `in:fly` on elements that are visible on initial page load causes them to animate on first render, which looks like a glitch (everything flies in when the page loads).
**Why it happens:** Svelte transitions trigger when elements enter the DOM. SSR-rendered elements enter the DOM on hydration.
**How to avoid:** For above-the-fold content (hero section), do NOT use Svelte `in:` transitions. Use CSS animations that trigger on page load instead (`animate-fade-in` class). Reserve `in:` transitions for elements that are conditionally rendered (e.g., toggled by scroll visibility).
**Warning signs:** Hero text flying in from below on every page load.

### Pitfall 5: Performance with Many Scroll Observers

**What goes wrong:** Creating an individual IntersectionObserver for every animated element degrades scroll performance, especially on mobile.
**Why it happens:** Each `use:inview` creates a separate observer by default.
**How to avoid:** Use a single observer for groups of elements (one `use:inview` on a parent section, then CSS transition-delay for staggered children). Limit the number of active observers to 10-15 maximum.
**Warning signs:** Jank during scroll on mobile devices.

### Pitfall 6: Paraglide Message Keys Becoming Unwieldy

**What goes wrong:** Flat message key namespaces become hard to manage as the number of translations grows across sections and pages.
**Why it happens:** Starting with ad-hoc key naming (e.g., `button_text`, `hero_title`, `card_1_description`) without a naming convention.
**How to avoid:** Use a consistent prefix convention: `{page}_{section}_{element}`. For the landing page: `landing_hero_tagline`, `landing_features_title`, `landing_pricing_free_name`. For shared UI: `ui_button_get_started`, `ui_nav_features`.
**Warning signs:** Multiple keys with similar names or confusion about which key belongs to which component.

## Code Examples

### Complete Navbar with Dark Mode Toggle and Language Switcher

```svelte
<!-- src/lib/components/landing/navbar.svelte -->
<script lang="ts">
  import { m } from '$lib/paraglide/messages.js';
  import { localizeHref, locales, getLocale } from '$lib/paraglide/runtime.js';
  import { page } from '$app/state';
  import { toggleMode, mode } from 'mode-watcher';
  import { Sun, Moon, Globe } from 'lucide-svelte';
  import Button from '$lib/components/ui/button.svelte';

  let scrolled = $state(false);

  // Sticky navbar with blur on scroll
  $effect(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 20;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<nav
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300
    {scrolled
      ? 'bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl shadow-md'
      : 'bg-transparent'}"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href={localizeHref('/')} class="font-display font-bold text-xl">
        BriefAgent
      </a>

      <!-- Nav links -->
      <div class="hidden md:flex items-center gap-8">
        <a href="#features" class="text-sm font-medium text-neutral-600 dark:text-neutral-400
          hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
          {m.nav_features()}
        </a>
        <a href="#how-it-works" class="text-sm font-medium text-neutral-600 dark:text-neutral-400
          hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
          {m.nav_how_it_works()}
        </a>
        <a href="#pricing" class="text-sm font-medium text-neutral-600 dark:text-neutral-400
          hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
          {m.nav_pricing()}
        </a>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- Language switcher -->
        <div class="flex items-center gap-1">
          <Globe class="w-4 h-4 text-neutral-500" />
          {#each locales as locale}
            <a
              href={localizeHref(page.url.pathname, { locale })}
              class="text-xs font-medium px-2 py-1 rounded-md transition-colors
                {getLocale() === locale
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}"
              data-sveltekit-reload
            >
              {locale.toUpperCase()}
            </a>
          {/each}
        </div>

        <!-- Theme toggle -->
        <button
          onclick={toggleMode}
          class="p-2 rounded-lg transition-all duration-200
            hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Toggle theme"
        >
          {#if $mode === 'dark'}
            <Sun class="w-5 h-5" />
          {:else}
            <Moon class="w-5 h-5" />
          {/if}
        </button>

        <!-- CTA -->
        <Button variant="primary" size="sm" href="/signup">
          {m.hero_cta()}
        </Button>
      </div>
    </div>
  </div>
</nav>
```

### Pricing Card with Beta Badge

```svelte
<!-- Pricing section pattern -->
<script lang="ts">
  import { m } from '$lib/paraglide/messages.js';
  import { inview } from 'svelte-inview';
  import { Check } from 'lucide-svelte';

  let visible = $state(false);

  const tiers = [
    {
      name: () => m.pricing_free_title(),
      price: () => m.pricing_free_price(),
      description: () => m.pricing_free_description(),
      features: ['1 product', '1 social account', '10 posts/month'],
      highlighted: false,
    },
    {
      name: () => m.pricing_pro_title(),
      price: () => m.pricing_pro_price(),
      description: () => m.pricing_pro_description(),
      features: ['3 products', '5 social accounts', '100 posts/month', 'Autopilot mode', 'No watermark'],
      highlighted: true,
    },
    {
      name: () => m.pricing_agency_title(),
      price: () => m.pricing_agency_price(),
      description: () => m.pricing_agency_description(),
      features: ['10 products', '20 social accounts', 'Unlimited posts', 'Team members (3)', 'Priority support'],
      highlighted: false,
    },
  ];
</script>

<section
  id="pricing"
  class="py-24 px-4"
  use:inview={{ rootMargin: '-100px' }}
  oninview={() => visible = true}
>
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each tiers as tier, i}
        <div
          class="relative rounded-2xl p-8 transition-all duration-600 ease-out
            {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            {tier.highlighted
              ? 'bg-primary-500 text-white shadow-glow-lg scale-105'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800'}"
          style="transition-delay: {i * 150}ms"
        >
          <!-- Beta badge -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
              bg-accent-500 text-white">
              {m.pricing_beta_badge()}
            </span>
          </div>

          <h3 class="text-xl font-display font-bold">{tier.name()}</h3>
          <div class="mt-4">
            <span class="text-4xl font-bold">{tier.price()}</span>
            <span class="text-sm opacity-70 line-through ml-2">
              {m.pricing_coming_soon()}
            </span>
          </div>
          <p class="mt-2 text-sm opacity-80">{tier.description()}</p>

          <ul class="mt-6 space-y-3">
            {#each tier.features as feature}
              <li class="flex items-center gap-2 text-sm">
                <Check class="w-4 h-4 shrink-0" />
                {feature}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </div>
</section>
```

## Discretion Recommendations

Based on research of Gumloop and Relume.io reference sites, here are recommendations for the areas left to Claude's discretion:

### Color Palette Direction
**Recommendation:** Vibrant violet-purple primary (OKLCH hue ~275-285) with warm orange-coral accent. This blends Relume.io's purple (#6248FF) with Gumloop's warm, energetic feel. OKLCH ensures perceptually smooth gradients. The purple is bold enough to avoid "safe SaaS blue" while remaining professional for a marketing platform. See the theme.css example above for the full scale.

### Background Treatment
**Recommendation:** Mixed sections with a dark hero and alternating light/dark sections. Specifically: dark hero (dramatic gradient), light features section, light how-it-works, dark pricing section, light CTA footer. This creates visual rhythm and keeps the page dynamic. Both Gumloop and Relume.io use mixed light/dark sections. The dark hero with gradient establishes the creative, energetic mood immediately.

### How-It-Works Section Format
**Recommendation:** 3-step linear with numbered steps and connecting visual elements (dotted line or gradient connector between steps). Steps: (1) Brief your product, (2) AI generates your strategy, (3) Review and publish. Each step gets an icon/illustration and brief description. Simpler than a visual pipeline, more scannable, and translates well to mobile (vertical stack).

### Feature Count and Selection
**Recommendation:** 6 features in a 3x2 grid (2 columns on mobile). Suggested features: (1) AI Content Strategy -- full 2-week plans generated from your brief, (2) Original AI Visuals -- brand-informed image generation, not templates, (3) Platform-Optimized Copy -- scroll-stopping hooks, engaging body, goal-aligned CTAs, (4) One-Click Publishing -- schedule and auto-publish to LinkedIn, (5) Deep Brand Understanding -- your brief teaches the AI your voice, audience, and goals, (6) Review and Approve -- AI proposes, you dispose, always in control.

### Hero Section Visual Treatment
**Recommendation:** Gradient background (dark purple to near-black with subtle animated mesh/grain texture) + product mockup showing the dashboard/calendar. No particles (they feel dated). The gradient should use the primary palette with a subtle animated gradient-shift. A floating product screenshot (with shadow-glow) gives visitors an immediate sense of what the product looks like. The tagline and CTA sit left-aligned; the mockup floats right.

### Navbar Behavior
**Recommendation:** Sticky with backdrop blur. Transparent on initial load, transitions to blurred glass-morphism effect (`bg-white/80 backdrop-blur-xl`) once the user scrolls past 20px. This is the dominant pattern on both reference sites and modern landing pages. Auto-hide is disorienting and hides the CTA.

### Icon Set
**Recommendation:** Lucide Svelte. 1500+ icons, tree-shakable, Svelte 5 native components, consistent design language, TypeScript types. Used by shadcn-svelte/Bits UI ecosystem. Latest version 0.564.x.

### Component Set Depth for Phase 1
**Recommendation:** Build these design system components now (landing page needs them AND Phase 2 will reuse them):

**Must build for Phase 1:**
- Button (primary, secondary, ghost, outline variants; sm/md/lg sizes)
- Card (with hover effects, border options)
- Badge (for pricing tiers, beta labels)
- Section (consistent padding, max-width container)
- Container (responsive max-width wrapper)
- Navbar (sticky, blur, responsive)
- Footer (links, social, copyright)
- ThemeToggle (light/dark/system)
- LanguageSwitcher (EN/ES)

**Build now to save Phase 2 rework:**
- Input (text, email -- signup form needs it)
- Dialog (Bits UI wrapper -- will be everywhere in Phase 2)
- Tooltip (Bits UI wrapper -- useful for pricing feature explanations)
- Separator (horizontal rule -- section dividers)
- Avatar (will be needed for testimonials if added, and throughout Phase 2)

### Typography Choices
**Recommendation:**
- **Display/Headings:** Plus Jakarta Sans (variable font). Geometric sans-serif with personality -- rounder than Inter, more playful, matches the "creative, confident" mood. Used by modern creative platforms.
- **Body:** Inter (variable font). The most-used typeface on the web for good reason -- exceptional readability at all sizes, tall x-height, clean Swiss aesthetic. Pairs well with Plus Jakarta Sans.
- **Mono:** JetBrains Mono (for any code or technical elements, future phases).

Self-host via Fontsource npm packages for privacy and performance. Preload the woff2 files in `app.html`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` for design tokens | `@theme` directive in CSS | Tailwind CSS v4 (Jan 2026) | No JS config file needed; tokens are CSS-first; automatic CSS custom property generation |
| `darkMode: 'class'` in tailwind.config | `@custom-variant dark (&:where(.dark, .dark *))` in CSS | Tailwind CSS v4 | Dark mode configured in CSS, not JS config |
| Runtime i18n (svelte-i18n, i18next) | Paraglide JS compile-time i18n | Paraglide 2.0 / Svelte CLI | 70% smaller bundles; type-safe; no async waterfalls; official Svelte recommendation |
| Separate i18n adapter packages | `sv add paraglide` (built into Svelte CLI) | Paraglide 2.0 | Adapters not needed; Vite plugin handles everything |
| Framer Motion / GSAP for scroll reveals | CSS transitions + IntersectionObserver | CSS capabilities matured | Much smaller bundle; no JS animation runtime needed for basic reveals |
| HSLA/RGB colors in design systems | OKLCH colors in design systems | Tailwind CSS v4 default | Perceptually uniform; wider gamut; smoother gradients; predictable lightness/chroma modifications |

**Deprecated/outdated:**
- `tailwind.config.js` / `tailwind.config.ts`: Replaced by CSS-first configuration with `@import "tailwindcss"` + `@theme {}`. Still works for backward compatibility but not the recommended approach for new projects.
- `@inlang/paraglide-js-adapter-sveltekit`: Adapters are no longer needed in Paraglide JS 2.0. The Vite plugin handles SvelteKit integration directly.
- Bits UI v1: v2 is the current release with Svelte 5 support. Component APIs may differ from v1 docs.

## Open Questions

1. **Exact Plus Jakarta Sans variable font axis configuration**
   - What we know: Plus Jakarta Sans is available as a variable font via Fontsource with weight axis 200-800.
   - What's unclear: Whether the Fontsource variable package includes italic axis or requires a separate italic import.
   - Recommendation: Test during implementation. If italic axis is missing, import the static italic weights needed (likely just 400 italic for body emphasis).

2. **Paraglide 2.0 message file format details**
   - What we know: Messages are defined in JSON files under a messages/ directory. Paraglide compiles them to tree-shakable JS functions. The `sv add paraglide` command sets up the Vite plugin and hooks.
   - What's unclear: Exact nesting support in message files (can you do `{ "hero": { "title": "..." } }` or must keys be flat?). Also unclear: ICU message format support for plurals/gender in Paraglide 2.0.
   - Recommendation: Start with flat keys using prefix convention (`landing_hero_tagline`). Test nesting during setup. For this phase, plurals/ICU are unlikely needed (landing page text is static).

3. **svelte-inview event API in Svelte 5**
   - What we know: svelte-inview 4.0.4 has Svelte 5 peer dependency fix. Uses `use:inview` action.
   - What's unclear: Whether the event API uses Svelte 5's `on*` attribute style or the older `on:*` directive style. Callback signature may differ.
   - Recommendation: Check the actual API during implementation. If events use old `on:inview_change` syntax, may need to adapt or use the action's return value directly.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) - Complete @theme directive documentation, namespaces, OKLCH colors, keyframes
- [Tailwind CSS v4 Dark Mode](https://tailwindcss.com/docs/dark-mode) - @custom-variant dark mode configuration
- [Tailwind CSS v4 SvelteKit Guide](https://tailwindcss.com/docs/guides/sveltekit) - Official setup with @tailwindcss/vite plugin
- [Tailwind CSS v4.0 Release Blog](https://tailwindcss.com/blog/tailwindcss-v4) - CSS-first config, performance improvements, new features
- [Paraglide SvelteKit Integration](https://inlang.com/m/dxnzrydw/paraglide-sveltekit-i18n/) - Setup, hooks, routing, message usage
- [Paraglide - Svelte CLI Docs](https://svelte.dev/docs/cli/paraglide) - Official sv add paraglide setup
- [Bits UI Official Site](https://bits-ui.com/) - v2, 40+ headless components, Svelte 5 support
- [Bits UI npm](https://www.npmjs.com/package/bits-ui) - v2.15.5 latest
- [Lucide Svelte](https://lucide.dev/guide/packages/lucide-svelte) - Icon integration, v0.564.x
- [mode-watcher GitHub](https://github.com/svecosystem/mode-watcher) - Dark mode management for SvelteKit

### Secondary (MEDIUM confidence)
- [Gumloop.com](https://gumloop.com) - Design reference: light/dark system, entrance animations, carousel effects, blur transitions, cursor simulations, tab interface
- [Relume.io](https://relume.io) - Design reference: primary purple #6248FF, off-white #F1F0EE, GSAP animations, parallax, animated gradient text
- [svelte-inview GitHub](https://github.com/svelte-inview/svelte-inview) - v4.0.4, Intersection Observer action, Svelte 5 compatible
- [svelte-inview npm](https://www.npmjs.com/package/svelte-inview) - Version confirmation
- [Fontsource SvelteKit Guide](https://fontsource.org/docs/guides/svelte) - Self-hosted font setup
- [Inter Font](https://rsms.me/inter/) - Variable font details, weight/optical size axes
- [OKLCH Color Space](https://oklch.org/) - Perceptually uniform color, Tailwind v4 default format

### Tertiary (LOW confidence)
- [svelte-motion](https://svelte-motion.gradientdescent.de/) - Framer Motion port for Svelte; referenced but NOT recommended for this phase (overkill)
- [Plus Jakarta Sans on Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans) - Font characteristics (not verified via direct fetch)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Tailwind v4, Bits UI, Paraglide, Lucide all verified with official docs and npm registries
- Architecture: HIGH - Pattern recommendations based on official Tailwind v4 and SvelteKit documentation
- Pitfalls: HIGH - FOUC, i18n text expansion, SSR transitions are well-documented engineering challenges
- Design direction: MEDIUM - Based on analysis of Gumloop and Relume.io, but color values are recommendations not verified against the exact sites' computed styles (HTML analysis only)

**Research date:** 2026-02-15
**Valid until:** 2026-04-15 (libraries are stable; design tokens are project-specific)
