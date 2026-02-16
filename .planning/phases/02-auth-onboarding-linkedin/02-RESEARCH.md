# Phase 2: Auth, Onboarding & LinkedIn - Research

**Researched:** 2026-02-16
**Domain:** Authentication, multi-step onboarding, file uploads, LinkedIn OAuth integration
**Confidence:** HIGH (verified against official docs for Supabase, LinkedIn, Drizzle)

## Summary

Phase 2 transitions BriefAgent from a static frontend (landing page + mock dashboard) to a functional backend-connected application. It covers four major domains: (1) email/password authentication with Supabase Auth SSR, (2) a multi-step onboarding wizard (Quick Start with URL scraping, Deep Brief), (3) an asset library with file uploads to Supabase Storage, and (4) LinkedIn OAuth for personal profiles and company pages.

The stack choices from the earlier STACK.md research are confirmed and refined here: Supabase Auth via `@supabase/ssr` for cookie-based SSR authentication in SvelteKit, Drizzle ORM for type-safe database access, Supabase Storage for file uploads, and direct LinkedIn REST API integration (no wrapper library). The existing SvelteKit project already has the routing structure (`(landing)` layout group for public pages, `/dashboard` for the app) and the design system (Cyan/Orange/Pink, Bricolage Grotesque + Fira Code, dark-first).

The most complex domain is LinkedIn OAuth, which requires careful handling of token lifecycle, API versioning headers, and a multi-step image upload process. The most user-facing risk is onboarding UX -- if the Quick Start or Deep Brief feels tedious, users churn before seeing value. Website scraping must be non-blocking and gracefully degrade.

**Primary recommendation:** Use Supabase Auth + `@supabase/ssr` for authentication (handles email/password, verification, sessions, password reset out of the box). Use Drizzle ORM with Supabase's PostgreSQL for the database layer. Use Supabase Storage for file uploads. Build LinkedIn OAuth as a direct REST API integration with a thin service abstraction layer. All scraping runs as a background task via SvelteKit server endpoints -- no heavy headless browser in Phase 2.

## Standard Stack

### Core (Phase 2 additions to existing project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | ^2.x | Supabase client (auth, storage, DB) | Official Supabase client for JS |
| `@supabase/ssr` | ^0.5.x | SSR auth helpers for SvelteKit | Official cookie-based SSR auth; handles token refresh in hooks |
| `drizzle-orm` | ^0.38.x / ^1.0-beta | Type-safe ORM for PostgreSQL | SQL-like syntax, inferred types, lightweight; recommended in STACK.md |
| `drizzle-kit` | ^0.30.x / ^1.0-beta | Schema migrations and Drizzle Studio | Migration generation and push tooling |
| `postgres` | ^3.x | PostgreSQL driver | Required by Drizzle for Supabase connection |
| `zod` | ^3.x | Schema validation | API input validation, form validation, AI structured output schemas |
| `sharp` | ^0.33.x | Image processing | Resize/optimize uploaded assets, validate image formats |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `cheerio` | ^1.x | HTML parsing for URL scraping | Parse meta tags, OG data from fetched HTML (lightweight, no headless browser) |
| `node-html-parser` | ^6.x | Alternative fast HTML parser | If cheerio is too heavy; parses HTML 2-3x faster |
| `date-fns` | ^3.x | Date manipulation | Timezone handling for user preferences |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Auth | Lucia Auth | Lucia is more flexible but requires manual session management; Supabase bundles auth+DB+storage |
| Supabase Auth | Auth.js (NextAuth) | Auth.js has SvelteKit support but less tight integration with Supabase ecosystem |
| Drizzle ORM | Prisma | Prisma is more established but heavier, generated types, slower cold starts |
| `cheerio` for scraping | Playwright/Puppeteer | Headless browser captures JS-rendered content but is heavy (~200-500MB), slow, expensive to run; defer to Phase 3 if needed |
| Direct LinkedIn API | `linkedin-api` npm package | No well-maintained wrapper exists; direct REST is more reliable and documented |

**Installation:**
```bash
pnpm add @supabase/supabase-js @supabase/ssr drizzle-orm postgres zod sharp cheerio date-fns
pnpm add -D drizzle-kit
```

## Architecture Patterns

### Project Structure (Phase 2 additions)

```
src/
  lib/
    server/
      db/
        index.ts           # Drizzle client instance (server-only)
        schema.ts           # All Drizzle table definitions
        migrations/         # Generated migration SQL files
      auth.ts              # Auth helper utilities
      linkedin/
        oauth.ts           # LinkedIn OAuth flow handlers
        api.ts             # LinkedIn API client (posts, images)
        tokens.ts          # Token encryption/decryption
      scraping/
        index.ts           # URL scraping pipeline
        extractors.ts      # Meta tag, OG data, color extraction
      storage.ts           # Supabase Storage upload helpers
    supabase.ts            # Browser Supabase client factory
  hooks.server.ts          # Supabase SSR auth middleware
  routes/
    (landing)/             # Existing public pages
    (auth)/                # New: auth layout group (no navbar/footer, centered forms)
      login/+page.svelte
      signup/+page.svelte
      forgot-password/+page.svelte
      reset-password/+page.svelte
      verify-email/+page.svelte
      callback/+server.ts  # Supabase auth callback handler
    dashboard/             # Existing: now requires auth
      +layout.server.ts    # Auth guard: redirect to login if not authenticated
      onboarding/
        +layout.svelte     # Onboarding stepper layout
        quick-start/+page.svelte
        deep-brief/+page.svelte
        assets/+page.svelte
        complete/+page.svelte
      settings/
        linkedin/+page.svelte   # LinkedIn connection management
    api/
      oauth/
        linkedin/
          authorize/+server.ts   # Redirect to LinkedIn consent
          callback/+server.ts    # Handle LinkedIn OAuth callback
      scrape/+server.ts          # URL scraping endpoint
      assets/
        upload/+server.ts        # File upload endpoint
drizzle.config.ts                # Drizzle Kit configuration
```

### Pattern 1: Supabase Auth SSR in SvelteKit

**What:** Cookie-based authentication using `@supabase/ssr` with server hooks for session management.

**When to use:** Every request that touches auth state.

**Example:**
```typescript
// src/hooks.server.ts
// Source: https://supabase.com/docs/guides/auth/server-side/sveltekit
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' });
          });
        },
      },
    }
  );

  // Use getUser() instead of getSession() for verified server-side auth
  event.locals.getUser = async () => {
    const { data: { user }, error } = await event.locals.supabase.auth.getUser();
    if (error) return null;
    return user;
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    },
  });
};
```

```typescript
// src/routes/dashboard/+layout.server.ts
// Auth guard for all dashboard routes
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const user = await locals.getUser();
  if (!user) throw redirect(303, '/login');
  return { user };
};
```

### Pattern 2: Drizzle Schema with Supabase

**What:** Type-safe database schema defined in code, migrations managed by Drizzle Kit.

**When to use:** All database interactions.

**Example:**
```typescript
// src/lib/server/db/schema.ts
import { pgTable, uuid, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References Supabase auth.users
  name: text('name').notNull(),
  websiteUrl: text('website_url'),
  description: text('description'),
  logoUrl: text('logo_url'),
  scrapedData: jsonb('scraped_data'),
  onboardingStep: text('onboarding_step').default('quick_start'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productBriefs = pgTable('product_briefs', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).unique(),
  problemSolved: text('problem_solved'),
  keyFeatures: text('key_features').array(),
  differentiator: text('differentiator'),
  pricingInfo: text('pricing_info'),
  productStage: text('product_stage'),
  idealCustomer: text('ideal_customer'),
  industry: text('industry'),
  ageRange: text('age_range'),
  painPoints: text('pain_points').array(),
  audienceHangouts: text('audience_hangouts').array(),
  personalityTraits: text('personality_traits').array(),
  exampleContent: text('example_content'),
  wordsToUse: text('words_to_use').array(),
  wordsToAvoid: text('words_to_avoid').array(),
  mainGoal: text('main_goal'),
  postingFrequency: text('posting_frequency'),
  preferredTimes: jsonb('preferred_times'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size'),
  tag: text('tag'), // screenshot | photo | logo | lifestyle | testimonial | graphic
  description: text('description'),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const platformAccounts = pgTable('platform_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(), // 'linkedin'
  accountType: text('account_type').notNull(), // 'personal' | 'company_page'
  platformUserId: text('platform_user_id').notNull(),
  platformUserName: text('platform_user_name'),
  platformAvatarUrl: text('platform_avatar_url'),
  accessToken: text('access_token').notNull(), // Encrypted
  refreshToken: text('refresh_token'), // Encrypted
  tokenExpiresAt: timestamp('token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  status: text('status').default('active'), // active | needs_reconnect | revoked
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

```typescript
// src/lib/server/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { SUPABASE_DB_URL } from '$env/static/private';
import * as schema from './schema';

const client = postgres(SUPABASE_DB_URL, { prepare: false }); // prepare: false for Supabase connection pooler
export const db = drizzle(client, { schema });
```

### Pattern 3: LinkedIn OAuth Flow (Server-Side Only)

**What:** 3-legged OAuth 2.0 flow entirely on the server. Browser never sees tokens.

**When to use:** Connecting LinkedIn accounts.

**Example:**
```typescript
// src/routes/api/oauth/linkedin/authorize/+server.ts
import { redirect } from '@sveltejs/kit';
import { LINKEDIN_CLIENT_ID } from '$env/static/private';
import type { RequestHandler } from './$types';
import crypto from 'crypto';

export const GET: RequestHandler = async ({ cookies, url }) => {
  const state = crypto.randomBytes(32).toString('hex');
  cookies.set('linkedin_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });

  const productId = url.searchParams.get('product_id');
  if (productId) {
    cookies.set('linkedin_oauth_product', productId, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600,
    });
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: `${url.origin}/api/oauth/linkedin/callback`,
    state,
    scope: 'openid profile email w_member_social',
    // Request all foreseeable scopes upfront (Pitfall 15)
    // Add w_organization_social when MDP approved
  });

  throw redirect(302, `https://www.linkedin.com/oauth/v2/authorization?${params}`);
};
```

```typescript
// src/routes/api/oauth/linkedin/callback/+server.ts
import { redirect, error } from '@sveltejs/kit';
import { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET } from '$env/static/private';
import { db } from '$lib/server/db';
import { platformAccounts } from '$lib/server/db/schema';
import { encrypt } from '$lib/server/linkedin/tokens';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
  const user = await locals.getUser();
  if (!user) throw error(401, 'Not authenticated');

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('linkedin_oauth_state');
  const productId = cookies.get('linkedin_oauth_product');

  if (!code || !state || state !== storedState) {
    throw error(400, 'Invalid OAuth callback');
  }

  // Exchange code for tokens
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
      redirect_uri: `${url.origin}/api/oauth/linkedin/callback`,
    }),
  });

  if (!tokenResponse.ok) {
    throw error(500, 'Failed to exchange authorization code');
  }

  const tokens = await tokenResponse.json();
  // tokens: { access_token, expires_in (60 days), refresh_token?, refresh_token_expires_in? }

  // Fetch user profile
  const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await profileResponse.json();

  // Store encrypted tokens
  await db.insert(platformAccounts).values({
    productId,
    platform: 'linkedin',
    accountType: 'personal', // Determine from flow
    platformUserId: profile.sub,
    platformUserName: profile.name,
    platformAvatarUrl: profile.picture,
    accessToken: encrypt(tokens.access_token),
    refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
    tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    refreshTokenExpiresAt: tokens.refresh_token_expires_in
      ? new Date(Date.now() + tokens.refresh_token_expires_in * 1000)
      : null,
  });

  // Clean up cookies
  cookies.delete('linkedin_oauth_state', { path: '/' });
  cookies.delete('linkedin_oauth_product', { path: '/' });

  throw redirect(303, '/dashboard/settings/linkedin?connected=true');
};
```

### Pattern 4: Encrypted Token Storage

**What:** AES-256-GCM encryption for OAuth tokens at the application level.

**When to use:** Storing any third-party credentials.

**Example:**
```typescript
// src/lib/server/linkedin/tokens.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { TOKEN_ENCRYPTION_KEY } from '$env/static/private';

const KEY = Buffer.from(TOKEN_ENCRYPTION_KEY, 'hex'); // 32 bytes

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(encrypted: string): string {
  const [ivHex, tagHex, dataHex] = encrypted.split(':');
  const decipher = createDecipheriv('aes-256-gcm', KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return decipher.update(dataHex, 'hex', 'utf8') + decipher.final('utf8');
}
```

### Pattern 5: Non-Blocking URL Scraping

**What:** URL scraping runs as a background operation, never blocks onboarding.

**When to use:** Quick Start onboarding step when user enters a website URL.

**Example:**
```typescript
// src/lib/server/scraping/index.ts
import * as cheerio from 'cheerio';

interface ScrapedData {
  title?: string;
  description?: string;
  ogImage?: string;
  themeColor?: string;
  favicon?: string;
  keyPhrases: string[];
  success: boolean;
  error?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000); // 10s max

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BriefAgentBot/1.0)',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      return { keyPhrases: [], success: false, error: `HTTP ${response.status}` };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    return {
      title: $('meta[property="og:title"]').attr('content') || $('title').text() || undefined,
      description: $('meta[property="og:description"]').attr('content')
        || $('meta[name="description"]').attr('content') || undefined,
      ogImage: $('meta[property="og:image"]').attr('content') || undefined,
      themeColor: $('meta[name="theme-color"]').attr('content') || undefined,
      favicon: $('link[rel="icon"]').attr('href')
        || $('link[rel="shortcut icon"]').attr('href') || undefined,
      keyPhrases: extractKeyPhrases($),
      success: true,
    };
  } catch (err) {
    return {
      keyPhrases: [],
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  } finally {
    clearTimeout(timeout);
  }
}

function extractKeyPhrases($: cheerio.CheerioAPI): string[] {
  const keywords = $('meta[name="keywords"]').attr('content');
  if (keywords) return keywords.split(',').map(k => k.trim()).filter(Boolean).slice(0, 10);
  // Fallback: extract from h1, h2 headings
  const headings: string[] = [];
  $('h1, h2').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 100) headings.push(text);
  });
  return headings.slice(0, 10);
}
```

### Pattern 6: File Upload via Supabase Storage

**What:** Upload files to Supabase Storage bucket with server-side validation.

**When to use:** Asset Library uploads and logo uploads.

**Example:**
```typescript
// src/routes/api/assets/upload/+server.ts
import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { assets } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = await locals.getUser();
  if (!user) throw error(401, 'Not authenticated');

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const productId = formData.get('product_id') as string;
  const tag = formData.get('tag') as string;
  const description = formData.get('description') as string;

  if (!file || !productId) throw error(400, 'Missing file or product_id');
  if (!ALLOWED_TYPES.includes(file.type)) throw error(400, 'Invalid file type');
  if (file.size > MAX_SIZE) throw error(400, 'File too large (max 10MB)');

  // Upload to Supabase Storage
  const filePath = `${user.id}/${productId}/${crypto.randomUUID()}-${file.name}`;
  const { data, error: uploadError } = await locals.supabase.storage
    .from('assets')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw error(500, 'Upload failed');

  // Get public URL
  const { data: { publicUrl } } = locals.supabase.storage
    .from('assets')
    .getPublicUrl(filePath);

  // Create asset record
  const [asset] = await db.insert(assets).values({
    productId,
    fileUrl: publicUrl,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    tag,
    description,
  }).returning();

  return json(asset);
};
```

### Anti-Patterns to Avoid

- **Never trust `getSession()` on the server.** Always use `getUser()` which makes a round-trip to Supabase Auth server. `getSession()` reads from the cookie and can be tampered with.
- **Never expose LinkedIn tokens to the browser.** All OAuth handling is server-side. The frontend triggers flows via redirect, never sees tokens.
- **Never block onboarding on URL scraping.** Scraping is fire-and-forget. Show whatever was extracted, let user fill in manually, and save immediately.
- **Never store unencrypted OAuth tokens.** Even in the database, tokens must be AES-256-GCM encrypted at the application level.
- **Never use Supabase Auth for LinkedIn OAuth.** Supabase Auth supports OAuth providers, but LinkedIn's posting permissions (`w_member_social`) require the 3-legged flow with your own LinkedIn app credentials. Supabase's OAuth is for login identity only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email/password auth | Custom session management, password hashing, email sending | Supabase Auth | Handles signup, login, email verification, password reset, session refresh, JWT management. Battle-tested security. |
| File storage + CDN | Custom S3 integration + CloudFront | Supabase Storage | S3-compatible, CDN-backed, RLS-enabled. Already in the Supabase ecosystem. |
| Form validation | Manual if/else chains | Zod schemas | Type-safe validation with inference; use same schemas for API validation and form validation |
| Schema migrations | Raw SQL files | Drizzle Kit (`drizzle-kit push` / `generate`) | Type-safe migration generation from schema, rollback support |
| CSRF protection for OAuth | Custom token generation | SvelteKit's built-in CSRF + crypto.randomBytes state parameter | LinkedIn OAuth requires state parameter for CSRF; SvelteKit handles form CSRF |
| Image optimization | Custom ffmpeg/imagemagick pipeline | Sharp | Resize, format conversion, metadata stripping in a single optimized library |

**Key insight:** Supabase provides auth, storage, and database as a bundled platform. Using all three together eliminates integration complexity. Drizzle provides the type-safe query layer that Supabase's auto-generated REST API lacks for complex queries.

## Common Pitfalls

### Pitfall 1: Supabase Auth `getSession()` vs `getUser()` on Server

**What goes wrong:** Using `getSession()` on the server side to verify authentication. The session data in the cookie can be tampered with by the client.
**Why it happens:** `getSession()` is faster (reads from cookie, no network request). Developers optimize for speed.
**How to avoid:** Always use `getUser()` on the server, which validates the JWT against Supabase Auth server. Use `getSession()` only on the client for non-sensitive UI rendering.
**Warning signs:** Auth checks that feel too fast; no network requests to Supabase in server load functions.

### Pitfall 2: LinkedIn OAuth Scope Selection Is a One-Way Door

**What goes wrong:** If you change the requested OAuth scopes after users have connected, ALL existing access tokens are invalidated. Every user must re-authenticate.
**Why it happens:** LinkedIn's OAuth implementation invalidates tokens when scope changes, unlike other platforms.
**How to avoid:** Request ALL scopes you will need in the foreseeable future during the initial OAuth flow. For Phase 2: `openid profile email w_member_social`. Plan ahead for `w_organization_social` (requires MDP approval) and `r_organization_social`.
**Warning signs:** Planning to "add more scopes later."

### Pitfall 3: LinkedIn Tokens Expire and Refresh Tokens Require MDP Approval

**What goes wrong:** Access tokens expire after 60 days. Programmatic refresh tokens are only available to approved Marketing Developer Platform (MDP) partners. Without MDP approval, users must manually re-authenticate every 60 days.
**Why it happens:** Developers assume refresh tokens work like Google/GitHub OAuth. LinkedIn is different.
**How to avoid:** Apply for MDP partner status immediately. Build token health monitoring. Track `expires_at` for every account. Notify users 7 days before expiration. Build a smooth "reconnect" flow that's accessible from the dashboard, not buried in settings.
**Warning signs:** No token expiration tracking in the database; no re-auth notification system.

### Pitfall 4: Supabase Auth Callback Route Not Configured

**What goes wrong:** Supabase email verification and password reset links redirect to a callback URL. If this isn't configured as a route in SvelteKit, users see a 404 after clicking verification links.
**Why it happens:** The callback URL must be configured both in Supabase dashboard (Auth > URL Configuration) and as a SvelteKit route that exchanges the auth code.
**How to avoid:** Create `src/routes/(auth)/callback/+server.ts` that handles the code exchange. Set the site URL and redirect URLs in Supabase dashboard. Test the full email flow end-to-end.
**Warning signs:** Email verification links go to production URL during development; callback route missing.

### Pitfall 5: File Upload Size Limits in SvelteKit

**What goes wrong:** SvelteKit's default body size limit may reject large file uploads. The default varies by adapter.
**Why it happens:** Security defaults prevent large payloads. Developers test with small files and discover the limit in production.
**How to avoid:** Configure body size limits explicitly in `svelte.config.js`. For the node adapter, use the `bodyParser` options. Validate file size on the client before upload to provide immediate feedback.
**Warning signs:** Uploads work locally but fail in production; 413 errors.

### Pitfall 6: Website Scraping Blocking Onboarding

**What goes wrong:** Scraping a user's website takes 5-30 seconds (or fails entirely). If the UI waits for scraping to complete before proceeding, users feel stuck.
**Why it happens:** Treating scraping as a synchronous step in the onboarding flow.
**How to avoid:** Fire scraping as a background request. Let users proceed immediately. When scraping completes, update the form fields with extracted data. If scraping fails, show a non-blocking message and let users fill in manually.
**Warning signs:** A loading spinner that blocks the "Next" button while scraping is in progress.

## Code Examples

### Supabase Auth Callback Handler

```typescript
// src/routes/(auth)/callback/+server.ts
// Handles email verification and password reset callbacks
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      throw redirect(303, next);
    }
  }

  // Auth code exchange failed - redirect to error page
  throw redirect(303, '/login?error=auth_callback_failed');
};
```

### Signup Form Action

```typescript
// src/routes/(auth)/signup/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals: { supabase }, url }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required', email });
    }

    if (password.length < 8) {
      return fail(400, { error: 'Password must be at least 8 characters', email });
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${url.origin}/callback?next=/dashboard/onboarding/quick-start`,
      },
    });

    if (error) {
      return fail(400, { error: error.message, email });
    }

    // Redirect to check-email page
    throw redirect(303, '/verify-email');
  },
};
```

### LinkedIn API Version Header Pattern

```typescript
// src/lib/server/linkedin/api.ts
// Source: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
const LINKEDIN_API_VERSION = '202602'; // Use latest stable version

export function linkedinHeaders(accessToken: string) {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Linkedin-Version': LINKEDIN_API_VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
  };
}

// Get user profile (to retrieve person URN for posting)
export async function getLinkedInProfile(accessToken: string) {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
  // Returns: { sub: "person_id", name: "...", email: "...", picture: "..." }
}

// Create text-only post
export async function createTextPost(accessToken: string, personId: string, text: string) {
  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: linkedinHeaders(accessToken),
    body: JSON.stringify({
      author: `urn:li:person:${personId}`,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });

  if (res.status !== 201) {
    const err = await res.json();
    throw new Error(`LinkedIn post failed: ${JSON.stringify(err)}`);
  }

  // Post ID is in x-restli-id response header
  return res.headers.get('x-restli-id');
}

// Initialize image upload
export async function initializeImageUpload(accessToken: string, ownerUrn: string) {
  const res = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
    method: 'POST',
    headers: linkedinHeaders(accessToken),
    body: JSON.stringify({
      initializeUploadRequest: { owner: ownerUrn },
    }),
  });

  const data = await res.json();
  return {
    uploadUrl: data.value.uploadUrl,
    imageUrn: data.value.image,
    expiresAt: data.value.uploadUrlExpiresAt,
  };
}

// Upload image binary
export async function uploadImageBinary(uploadUrl: string, imageBuffer: Buffer, accessToken: string) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
    },
    body: imageBuffer,
  });

  if (!res.ok) throw new Error(`Image upload failed: ${res.status}`);
}

// Create post with image
export async function createImagePost(
  accessToken: string,
  authorUrn: string,
  text: string,
  imageUrn: string,
  altText?: string
) {
  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: linkedinHeaders(accessToken),
    body: JSON.stringify({
      author: authorUrn,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        media: {
          id: imageUrn,
          altText: altText || '',
        },
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });

  if (res.status !== 201) {
    const err = await res.json();
    throw new Error(`LinkedIn image post failed: ${JSON.stringify(err)}`);
  }

  return res.headers.get('x-restli-id');
}
```

### Onboarding Stepper Layout

```svelte
<!-- src/routes/dashboard/onboarding/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import * as m from '$lib/paraglide/messages.js';

  const steps = [
    { path: '/dashboard/onboarding/quick-start', label: 'Quick Start', number: 1 },
    { path: '/dashboard/onboarding/deep-brief', label: 'Deep Brief', number: 2 },
    { path: '/dashboard/onboarding/assets', label: 'Assets', number: 3 },
  ];

  let currentStep = $derived(
    steps.findIndex(s => $page.url.pathname.startsWith(s.path)) + 1 || 1
  );

  let { children } = $props();
</script>

<div class="mx-auto max-w-3xl px-6 py-12">
  <!-- Stepper indicator -->
  <div class="mb-12 flex items-center justify-center gap-4">
    {#each steps as step}
      <div class="flex items-center gap-2">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all"
          class:bg-primary-500={currentStep >= step.number}
          class:text-white={currentStep >= step.number}
          class:bg-neutral-800={currentStep < step.number}
          class:text-neutral-500={currentStep < step.number}
        >
          {step.number}
        </div>
        <span
          class="hidden text-sm font-medium sm:block"
          class:text-white={currentStep >= step.number}
          class:text-neutral-500={currentStep < step.number}
        >
          {step.label}
        </span>
      </div>
      {#if step.number < steps.length}
        <div
          class="h-px w-12 transition-colors"
          class:bg-primary-500={currentStep > step.number}
          class:bg-neutral-700={currentStep <= step.number}
        ></div>
      {/if}
    {/each}
  </div>

  {@render children()}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-sveltekit` | `@supabase/ssr` | 2024 | New package is framework-agnostic, uses `getAll`/`setAll` cookie pattern |
| Supabase `getSession()` trusted on server | `getUser()` required on server | 2024 | Security fix: session cookie can be tampered with client-side |
| LinkedIn Assets API (vector assets) | LinkedIn Images API (`/rest/images`) | 2024-2025 | New Images API is simpler; Assets API is deprecated |
| LinkedIn ugcPosts API | LinkedIn Posts API (`/rest/posts`) | 2024 | Posts API replaces ugcPosts; must use versioned headers |
| Drizzle ORM `serial()` for Postgres | `integer().generatedAlwaysAsIdentity()` | 2025 | PostgreSQL identity columns are now recommended over serial |
| Drizzle 0.x | Drizzle 1.0-beta (v0.38+) | Feb 2025 | Architecture rewrite; built-in Zod validation; faster introspection |
| LinkedIn Marketing API version 202502 | Version 202602 (latest) | Feb 2026 | Old version sunset; must use latest versioned APIs with YYYYMM header |

**Deprecated/outdated:**
- `@supabase/auth-helpers-sveltekit`: Replaced by `@supabase/ssr`. Do not use.
- LinkedIn Assets API (`/rest/assets`): Replaced by Images API (`/rest/images`). Do not use.
- LinkedIn `ugcPosts` API: Replaced by Posts API (`/rest/posts`). Do not use.
- `getSession()` for server-side auth verification: Use `getUser()` instead.

## Open Questions

1. **LinkedIn MDP Partner Status**
   - What we know: `w_member_social` is available via self-service "Share on LinkedIn" product. Personal profile posting works without MDP.
   - What's unclear: Whether `w_organization_social` (company page posting) requires MDP approval or can be obtained via another product. Refresh tokens definitely require MDP.
   - Recommendation: Apply for MDP immediately. Build Phase 2 with personal profile posting only (`w_member_social`). Add company page posting when MDP is approved. Design the UI to gracefully show "company page posting coming soon" if not yet approved.

2. **Supabase RLS vs Application-Level Auth**
   - What we know: Supabase Row Level Security can enforce data isolation at the database level. Drizzle ORM queries bypass RLS when using the service role key.
   - What's unclear: Whether to rely on RLS policies or application-level `WHERE user_id = ?` checks, or both.
   - Recommendation: Use Drizzle with the service role key for server-side queries (bypasses RLS). Enforce authorization in the application layer (SvelteKit server load functions and API routes). This gives more control and is easier to debug. Add RLS as defense-in-depth later.

3. **SvelteKit Adapter for Deployment**
   - What we know: Currently using `adapter-auto`. Phase 2 introduces server-side code (API routes, database connections).
   - What's unclear: Whether to switch to `adapter-node` now for Railway deployment or keep `adapter-auto`.
   - Recommendation: Switch to `@sveltejs/adapter-node` in Phase 2. Required for persistent server processes, database connections, and eventual background workers. `adapter-auto` is for platforms that auto-detect (Vercel, Netlify) which we're not targeting.

4. **Onboarding Skip/Resume Behavior**
   - What we know: Onboarding has 3 steps (Quick Start, Deep Brief, Assets). Users may not complete all steps in one session.
   - What's unclear: How to handle partially completed onboarding. Can users access the dashboard before completing onboarding?
   - Recommendation: Track `onboardingStep` on the product record. Allow users to skip to the dashboard at any point (they can always come back). Show a prominent "Complete your setup" banner on the dashboard if onboarding is incomplete. Never block access to the dashboard.

## Sources

### Primary (HIGH confidence)
- [Supabase SSR Auth for SvelteKit](https://supabase.com/docs/guides/auth/server-side/sveltekit) - SSR setup, hooks, client creation
- [Supabase Creating a Client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=sveltekit) - Browser and server client patterns
- [LinkedIn 3-Legged OAuth Flow](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow) - Full OAuth flow, parameters, token exchange (updated November 2025)
- [LinkedIn Programmatic Refresh Tokens](https://learn.microsoft.com/en-us/linkedin/shared/authentication/programmatic-refresh-tokens) - Refresh token lifecycle, 60-day access / 365-day refresh (updated October 2025)
- [LinkedIn Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api) - Post creation, versioning headers, permissions (updated November 2025)
- [LinkedIn Images API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/images-api) - Image upload flow: initializeUpload, binary upload, URN usage (updated February 2026)
- [Drizzle ORM with Supabase](https://orm.drizzle.team/docs/get-started/supabase-new) - Setup, schema, migrations with PostgreSQL
- [Supabase Storage Signed Upload URLs](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl) - Presigned upload pattern

### Secondary (MEDIUM confidence)
- [j4w8n/sveltekit-supabase-ssr](https://github.com/j4w8n/sveltekit-supabase-ssr) - Community reference implementation for Supabase SSR in SvelteKit
- [LinkedIn Posting API Guide (getlate.dev)](https://getlate.dev/blog/linkedin-posting-api) - Community guide covering scopes, products, and posting flow
- [Cheerio vs Puppeteer comparison (Proxyway, 2026)](https://proxyway.com/guides/cheerio-vs-puppeteer-for-web-scraping) - Scraping strategy guidance

### Tertiary (LOW confidence)
- [Drizzle ORM v1.0-beta.2 release](https://orm.drizzle.team/docs/latest-releases/drizzle-orm-v1beta2) - Latest Drizzle features; version may have changed since research

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Supabase Auth, Drizzle, and Storage are well-documented and verified against current docs
- Architecture: HIGH - Patterns follow official documentation and established SvelteKit conventions
- LinkedIn OAuth: HIGH - Verified against official Microsoft Learn docs (updated 2025-2026)
- LinkedIn API: HIGH - Posts API and Images API verified with current versioned endpoints
- Pitfalls: HIGH - Token lifecycle, scope invalidation, and image upload gotchas verified against official docs
- URL scraping: MEDIUM - Cheerio approach is sound for meta tags; may need headless browser fallback for JS-heavy sites

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (30 days - Supabase and LinkedIn APIs are stable; Drizzle is moving fast)
