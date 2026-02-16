# Domain Pitfalls

**Domain:** AI-powered social media marketing automation (LinkedIn-focused)
**Project:** BriefAgent.ai
**Researched:** 2026-02-15

---

## Critical Pitfalls

Mistakes that cause rewrites, user churn, or platform bans.

---

### Pitfall 1: LinkedIn OAuth Tokens Expire and Refresh Tokens Are Not Guaranteed

**What goes wrong:** Access tokens expire after 60 days. Programmatic refresh tokens are only available to approved Marketing Developer Platform (MDP) partners. Without MDP approval, there is no refresh token -- the user must manually re-authenticate every 60 days. Even with refresh tokens, they expire after 365 days (not rolling -- the TTL counts down from initial grant). LinkedIn also reserves the right to revoke tokens at any time for technical or policy reasons.

**Why it happens:** Developers assume OAuth refresh tokens work like other platforms (Google, etc.) where refresh tokens are standard and long-lived. LinkedIn's `w_member_social` permission (available via self-service "Share on LinkedIn" product) does NOT include programmatic refresh tokens. Those require MDP partner approval, which is a separate application process.

**Consequences:**
- Users wake up to find their scheduled posts failed silently because the token expired
- If you don't have MDP approval, users must re-authenticate every 60 days -- unacceptable for an automation product
- Even with refresh tokens, Day 360+ requires full re-authorization regardless
- LinkedIn can revoke tokens at any time, requiring graceful fallback

**Prevention:**
- Apply for MDP partner status early -- it requires a review process and is not instant
- Build token health monitoring from Day 1: track `expires_in` and `refresh_token_expires_in` for every user
- Implement proactive email/in-app notifications starting 7 days before token expiration
- Build a "reconnect LinkedIn" flow that is quick and painless (not buried in settings)
- Store token metadata (issued_at, expires_at, refresh_expires_at) alongside encrypted tokens
- Design the system to gracefully handle sudden token revocation: queue failed posts and notify users immediately
- Plan for the 365-day hard wall: remind users to re-authorize before the refresh token expires

**Detection:**
- Monitor for 401 responses from LinkedIn API
- Track token age across all users; alert when any token is >50 days old without refresh
- Dashboard showing token health distribution across users

**Phase:** MVP (Phase 1) -- this is foundational. Cannot ship without token lifecycle management.
**Severity:** CRITICAL
**Confidence:** HIGH (verified against LinkedIn official docs, November 2025)

**Source:** https://learn.microsoft.com/en-us/linkedin/shared/authentication/programmatic-refresh-tokens

---

### Pitfall 2: LinkedIn API Access Tiers Gate Everything

**What goes wrong:** The self-service "Share on LinkedIn" product only grants `w_member_social` (post on behalf of authenticated member). It does NOT grant `r_member_social` (read posts), organization posting permissions, analytics, or programmatic refresh tokens. Developers build features assuming full API access and discover at integration time that they cannot read back posts, access analytics, or post to company pages.

**Why it happens:** LinkedIn's API access is tiered across multiple products/programs: Open Permissions (self-service), Marketing Developer Platform (requires approval), and various partner programs. The documentation is spread across multiple pages and the distinction between what's available immediately versus what requires approval is unclear.

**Consequences:**
- Cannot read back published posts to confirm they went live (no `r_member_social` without approval)
- Cannot post to LinkedIn Company Pages without `w_organization_social` (requires MDP approval)
- Cannot build analytics features without additional permissions
- Building features against permissions you don't have wastes development time
- MDP approval can take weeks or months

**Prevention:**
- Map every planned feature to specific LinkedIn permissions on Day 1
- Apply for MDP partner status immediately -- do not wait until you need it
- Build MVP around `w_member_social` only (personal posts) since that's self-service
- Design the architecture so Company Page posting can be added later as a feature upgrade
- Document which features are gated behind which permission tiers

**Detection:**
- 403 responses from LinkedIn API with "forbidden" messages
- Feature requests from users that require permissions you don't have

**Phase:** Pre-MVP planning and Phase 1 architecture decisions.
**Severity:** CRITICAL
**Confidence:** HIGH (verified against LinkedIn official docs, June 2025)

**Source:** https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access

---

### Pitfall 3: LinkedIn API Versioning and Forced Migrations

**What goes wrong:** LinkedIn uses calendar-based API versioning (YYYYMM format). Older versions are actively sunset -- the January 2025 marketing version has already been deprecated as of this research. Every API call requires a `Linkedin-Version` header. When a version is sunset, all API calls using that version stop working. The Posts API replaced the older ugcPosts API, and the Images API replaced the Assets API.

**Why it happens:** LinkedIn migrates APIs on a rolling schedule. Developers pin to a version and forget about it. LinkedIn deprecates that version and the integration breaks silently or starts returning errors.

**Consequences:**
- Entire publishing pipeline stops working overnight when a version is sunset
- Must monitor LinkedIn's versioning page and migrate proactively
- Migration can require code changes (different request/response schemas between versions)
- If using deprecated APIs (ugcPosts, Assets API), you're already on borrowed time

**Prevention:**
- Use the latest stable version from Day 1 (currently `li-lms-2026-01` as of February 2026)
- Abstract LinkedIn API calls behind a versioned service layer -- never scatter raw API calls throughout the codebase
- Set up monitoring for LinkedIn developer blog and versioning announcements
- Build version migration as a planned maintenance task every 6 months
- Always include both required headers: `Linkedin-Version: YYYYMM` and `X-Restli-Protocol-Version: 2.0.0`

**Detection:**
- 400/404 responses mentioning deprecated version
- LinkedIn deprecation notices in API responses
- Calendar reminders for version sunset dates

**Phase:** Phase 1 architecture -- build the abstraction layer from the start.
**Severity:** CRITICAL
**Confidence:** HIGH (verified against LinkedIn official docs)

**Source:** https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api

---

### Pitfall 4: AI Image Generation Is Non-Deterministic and Expensive at Scale

**What goes wrong:** AI image generation (DALL-E 3, GPT-image-1, Flux, Stable Diffusion) produces inconsistent results across runs. The same prompt produces different compositions, styles, color palettes, and text rendering quality each time. Brand consistency -- matching specific logos, color schemes, fonts, and visual identity -- is the hardest unsolved problem in AI image generation. Text-in-image rendering frequently produces misspellings or garbled characters. At scale, generation costs compound rapidly.

**Why it happens:**
- Generative models are stochastic by design -- same prompt produces different outputs
- Models cannot reliably reproduce specific brand elements (exact logos, specific fonts, precise hex colors)
- Text rendering in images is a known weakness across all current models
- Fine-tuning on brand assets requires significant technical effort and per-brand model management
- Image generation API costs ($0.02-0.12+ per image depending on model/quality) add up when generating multiple variations per post

**Consequences:**
- Generated images don't match the user's brand, leading to rejection and churn
- Users lose trust when AI produces off-brand or unprofessional images
- Text in images has typos or illegible characters, requiring manual review
- Cost per user scales linearly with post frequency -- 3 posts/week with 3 variations each = 9 generations/week/user
- At 1,000 users: 9,000 image generations/week = $180-$1,080/week in image gen costs alone

**Prevention:**
- Do NOT promise fully automated image generation in MVP. Instead:
  - Generate 2-3 variations and let users pick/reject
  - Offer a "regenerate" button with a daily cap to control costs
- Build a template-based system as the primary path: branded templates with dynamic text overlays (using a library like Sharp, Canvas, or Satori) where AI generates accent elements only
- For AI generation, use detailed system prompts that encode brand guidelines (colors as descriptions, style references, mood boards) -- but set user expectations that exact brand matching is aspirational
- Implement image caching: if a user approves an image style, save the prompt and parameters as a "style preset"
- Track cost-per-user-per-month and set generation caps tied to pricing tiers
- Use cheaper/faster models for drafts, higher-quality models only for final generation
- Consider offering stock photo search (Unsplash/Pexels API) as an alternative to generation

**Detection:**
- Track image approval rate (generated vs. actually published) -- if below 50%, your generation quality is failing
- Monitor AI generation costs per user per month
- User feedback: "images don't match my brand" is the canary in the coal mine

**Phase:** Phase 1 (MVP) must have human-in-the-loop; Phase 2+ can improve automation.
**Severity:** CRITICAL
**Confidence:** HIGH (well-documented limitation of current generative models)

---

### Pitfall 5: AI-Generated Content Sounds Generic and Damages Professional Reputation

**What goes wrong:** LLM-generated LinkedIn posts sound like they were written by AI -- generic platitudes, overuse of certain phrases ("In today's fast-paced world...", "Let's dive in...", "Here's the thing..."), lack of personal voice, and no genuine insight. LinkedIn's algorithm and audience increasingly penalize obviously AI-generated content. Users posting AI-generated slop damage their professional reputation, then blame the tool.

**Why it happens:**
- Default LLM outputs converge on "average internet writing" -- polished but generic
- Without strong context about the user's expertise, industry, and voice, LLMs produce interchangeable content
- Most systems use simple prompts like "write a LinkedIn post about X" without sufficient context engineering
- LinkedIn's platform is personal -- readers follow people for their unique perspective, not generic takes

**Consequences:**
- Low engagement on published posts leads users to blame the tool and churn
- Users with strong personal brands refuse to post AI content that doesn't match their voice
- LinkedIn may flag or deprioritize accounts that consistently post AI-generated content
- Reputational damage: if a user's network notices the shift to generic AI content, it undermines their credibility

**Prevention:**
- Deep onboarding that captures: industry, expertise areas, tone preferences, example posts they admire, topics they care about, their hot takes
- Scrape the user's existing LinkedIn posts (if accessible) during onboarding to learn their voice
- Use a multi-stage generation pipeline:
  1. Generate a content angle/hook (not full post)
  2. User approves or tweaks the angle
  3. Generate full post with the approved angle + user's voice profile
  4. User edits before publishing
- Build a "voice calibration" feature where users rate sample posts as "sounds like me" or "doesn't sound like me"
- Inject specificity: prompt the LLM to include specific examples, data points, or anecdotes rather than generic statements
- Never auto-publish without user review in MVP -- build trust incrementally
- Maintain a per-user "voice profile" that evolves based on which generated content they approve vs. reject

**Detection:**
- Track edit distance between generated and published content -- high edit distance means poor quality
- Measure engagement rates on AI-generated vs. manually-written posts
- Track user approval rate and time-to-approve (long times = user is heavily editing)

**Phase:** Phase 1 (MVP) onboarding must capture voice data; Phase 2 improves personalization.
**Severity:** CRITICAL
**Confidence:** HIGH (widely documented challenge with AI content tools)

---

## High Pitfalls

Mistakes that cause significant rework or degrade user experience.

---

### Pitfall 6: LinkedIn Image Upload Is a Multi-Step Process That Can Fail Silently

**What goes wrong:** Posting an image to LinkedIn requires a 3-step process: (1) Initialize upload to get an upload URL, (2) PUT the binary image to that upload URL, (3) Use the returned image URN in the post creation call. Each step can fail independently. The upload URL expires (timestamp returned in `uploadUrlExpiresAt`). Image processing on LinkedIn's side is asynchronous -- an image can be in `WAITING_UPLOAD`, `PROCESSING`, or `PROCESSING_FAILED` state when you try to use it. Using an image URN before it reaches `AVAILABLE` status can cause post creation to fail.

**Why it happens:**
- LinkedIn's image pipeline is asynchronous -- you get a URN back immediately but the image isn't ready yet
- Developers POST the image and immediately try to create the post, not realizing there's a processing delay
- Upload URLs are time-limited and single-use
- Large images or GIFs take longer to process
- The Images API supports JPG, GIF, and PNG only (no WebP, SVG, AVIF)

**Consequences:**
- Posts fail to publish with cryptic errors about invalid image IDs
- Users see "post scheduled" but it never appears on LinkedIn
- Race conditions between image upload completion and post creation
- Images over 36 million pixels are rejected silently

**Prevention:**
- Implement a polling loop after image upload: check image status via GET until `status: "AVAILABLE"` (with timeout and exponential backoff)
- Pre-validate images before upload: check format (JPG/PNG/GIF only), pixel count (<36,152,320), and file size
- Convert AI-generated images to optimal format (PNG for graphics/text, JPG for photos) before upload
- Cache image URNs after successful upload so they can be reused across posts
- Implement retry logic for each step of the upload process independently
- Build an image upload status tracker in the database: `pending_upload -> uploaded -> processing -> available -> failed`
- If image processing fails, have a fallback: post as text-only or retry with a re-generated image

**Detection:**
- Monitor image upload success rate and average processing time
- Track posts that fail at the image-attachment step specifically
- Alert on increasing image processing failure rates

**Phase:** Phase 1 (MVP) -- image posting is core functionality.
**Severity:** HIGH
**Confidence:** HIGH (verified against LinkedIn Images API docs, February 2026)

**Source:** https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/images-api

---

### Pitfall 7: LinkedIn Rate Limits Are Opaque and Per-Application

**What goes wrong:** LinkedIn rate limits are not published in documentation. There are two kinds: per-application (total calls your app can make per day) and per-member (total calls per member per app per day). Limits reset at midnight UTC. When rate-limited, you get a 429 response. The only way to discover your actual limits is to make at least one API call and check the Developer Portal Analytics tab.

**Why it happens:**
- LinkedIn intentionally does not publish rate limits so they can adjust them without notice
- Developers don't monitor rate limit headers and discover limits only when they hit them
- Rate limits are per-application, meaning ALL your users share a single application-level quota
- As your user base grows, the application-level limit becomes the bottleneck

**Consequences:**
- At scale, a burst of scheduled posts (e.g., many users posting at 9 AM) can exhaust application-level rate limits
- When rate-limited, all subsequent publishing for ALL users fails until midnight UTC
- No way to predict exactly when you'll hit limits as LinkedIn doesn't publish the numbers
- LinkedIn sends email alerts at 75% quota usage, but with a 1-2 hour delay -- by then you may have already hit 100%

**Prevention:**
- Implement rate limit tracking: parse response headers for rate limit information
- Spread scheduled posts across time windows -- never batch all posts at the same timestamp
- Build a queue with rate-limit-aware scheduling: if approaching limits, delay non-urgent posts
- Log actual rate limits from the Developer Portal after your first API calls in production
- Design the publishing scheduler to space posts across the day (e.g., at least 5-minute gaps between users)
- Implement exponential backoff with jitter for 429 responses
- Monitor the 75% threshold email alerts and react before hitting 100%
- Consider requesting higher rate limits from LinkedIn as your user base grows (contact developer support)

**Detection:**
- Track 429 response rate as a percentage of total API calls
- Monitor daily API call volume vs. known limits
- Alert when daily usage exceeds 60% of known limit

**Phase:** Phase 1 (MVP) needs basic rate limiting; Phase 2 needs sophisticated queue management.
**Severity:** HIGH
**Confidence:** HIGH (verified against LinkedIn rate limits docs, August 2025)

**Source:** https://learn.microsoft.com/en-us/linkedin/shared/api-guide/concepts/rate-limits

---

### Pitfall 8: LinkedIn's `little` Text Format Has Gotchas for Content Generation

**What goes wrong:** LinkedIn's Posts API uses a special text format called `little` for the commentary field. It has reserved characters that must be escaped with backslashes: `|`, `{`, `}`, `@`, `[`, `]`, `(`, `)`, `<`, `>`, `#`, `\`, `*`, `_`, `~`. Mentions require exact name matching (case-sensitive). Hashtags have a specific template format. AI-generated content will frequently contain these reserved characters unescaped.

**Why it happens:**
- AI-generated content naturally uses characters like `@`, `#`, `*`, parentheses, brackets
- The `little` format is non-standard -- it's LinkedIn-specific, not Markdown or plain text
- Mention syntax requires a URN lookup: `@[Name](urn:li:person:ID)` -- you can't just write `@name`
- Organization mentions must match the FULL organization name exactly (case-sensitive)
- Hashtags must use the template format: `{hashtag|\\#|tagname}` when creating via API

**Consequences:**
- Posts fail to publish with cryptic parsing errors
- Mentions don't render as links -- they appear as plain text
- Hashtags don't become clickable
- Special characters in AI output get interpreted as `little` format syntax, causing garbled posts
- Bullet points using `*` get interpreted as bold/emphasis markers

**Prevention:**
- Build a `little` format sanitizer that runs on ALL AI-generated content before sending to LinkedIn
- Escape all reserved characters: `| { } @ [ ] ( ) < > # \ * _ ~`
- If AI generates mentions (`@CompanyName`), either resolve them to proper URNs or strip the `@`
- If AI generates hashtags, convert to proper `{hashtag|\\#|tag}` format
- Build unit tests with edge cases: content with URLs, email addresses, code snippets, emoji, bullet lists
- Test with LinkedIn's actual API early -- don't assume plain text works

**Detection:**
- Parse errors from LinkedIn Posts API
- Posts where mentions/hashtags appear as plain text instead of links
- User reports of garbled formatting

**Phase:** Phase 1 (MVP) -- must be built into the publishing pipeline.
**Severity:** HIGH
**Confidence:** HIGH (verified against LinkedIn little text format docs)

**Source:** https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/little-text-format

---

### Pitfall 9: Scheduling Reliability -- Timezone and DST Handling

**What goes wrong:** Users schedule posts in their local timezone. The server runs in UTC. Daylight Saving Time transitions cause posts to publish at the wrong time. Some users have multiple audiences in different timezones. "Schedule for 9 AM" means different things for different users, and the meaning shifts twice a year.

**Why it happens:**
- Storing scheduled times as UTC without recording the user's intended timezone
- Not accounting for DST transitions: a post scheduled for "every Tuesday at 9 AM EST" suddenly publishes at 10 AM or 8 AM during DST changes
- JavaScript Date objects and timezone handling are notoriously error-prone
- Server timezone may differ from the timezone used in the scheduling logic
- Recurring schedules are especially dangerous: a schedule created during EST may behave incorrectly during EDT

**Consequences:**
- Posts publish at wrong times, reducing engagement (timing matters heavily on LinkedIn)
- Users in non-US timezones are especially affected if timezone handling only considers US zones
- Recurring schedules drift by an hour twice a year
- Users lose trust: "I scheduled for 9 AM and it posted at 10 AM"

**Prevention:**
- Store the user's IANA timezone identifier (e.g., `America/New_York`), not just a UTC offset
- Store scheduled times as the user's local time + their timezone, not as pre-converted UTC
- Convert to UTC at execution time, not at scheduling time -- this correctly handles DST transitions
- Use a robust timezone library (date-fns-tz, Luxon, or Temporal API if available)
- For recurring schedules, store the recurrence rule in the user's local timezone and compute the next occurrence at execution time
- Write explicit tests for DST transition dates (second Sunday of March, first Sunday of November for US)
- Display the post time back to the user in their timezone with explicit timezone label (e.g., "9:00 AM EST")

**Detection:**
- Compare scheduled time vs. actual publish time and alert on discrepancies > 5 minutes
- Monitor for post-publish-time anomalies around DST transition dates
- User reports of wrong timing

**Phase:** Phase 1 (MVP) -- get this right from the start or face ongoing bugs.
**Severity:** HIGH
**Confidence:** HIGH (well-known engineering pitfall)

---

### Pitfall 10: Website Scraping for Onboarding Is Fragile and Slow

**What goes wrong:** Auto-scraping user websites during onboarding to extract brand information (colors, fonts, content topics, company description) fails frequently. Modern websites use client-side rendering (React/Next.js/Vue SPAs), lazy loading, cookie consent walls, Cloudflare protection, and dynamic content that server-side HTTP requests cannot access. Even when scraping works, extracting structured brand information from unstructured HTML is unreliable.

**Why it happens:**
- Simple HTTP GET requests only fetch the initial HTML -- JavaScript-rendered content is invisible
- Cookie consent banners block content from loading
- Cloudflare, Akamai, and other WAFs block automated requests
- Meta tags (og:image, description) are often missing or generic
- CSS extraction for colors/fonts requires parsing stylesheets and resolving imports, which is complex
- Small business websites are often built with Wix, Squarespace, or WordPress themes that have generic/template styling

**Consequences:**
- Onboarding flow hangs waiting for a scrape that will never complete
- Extracted brand information is wrong, leading to poor AI-generated content from the start
- User sees "analyzing your brand..." spinner for 30+ seconds, then gets garbage results
- Some websites simply cannot be scraped at all

**Prevention:**
- Make website scraping a "nice to have" enhancement, not a blocking step in onboarding
- Use a tiered approach:
  1. First try: Fetch HTML + parse meta tags (og:title, og:description, og:image, theme-color)
  2. Fallback: Use a headless browser service (Playwright/Puppeteer) for JS-rendered sites
  3. Final fallback: Ask the user to describe their brand manually
- Set aggressive timeouts: 10 seconds max for scraping, then fall through to manual input
- Cache scraping results so re-onboarding doesn't re-scrape
- Extract only what's reliable: page title, meta description, favicon, og:image, theme-color meta tag
- Do NOT try to extract full color palettes or fonts from CSS -- ask the user instead
- Consider using the user's LinkedIn profile as a secondary data source (if they grant read access)

**Detection:**
- Track scraping success rate by domain/technology (Wix vs. custom site, etc.)
- Monitor scraping timeout rate
- Track how many users skip/override scraped brand information

**Phase:** Phase 1 (MVP) onboarding -- but design for graceful degradation.
**Severity:** HIGH
**Confidence:** HIGH (well-documented web scraping challenges)

---

## Moderate Pitfalls

---

### Pitfall 11: AI Generation Cost Spirals

**What goes wrong:** Each post requires LLM calls (content generation, potentially multiple iterations) plus image generation. With multiple variations, regeneration, and preview cycles, costs per user per month can exceed revenue.

**Prevention:**
- Model the unit economics before launch:
  - LLM cost per post (GPT-4 class: ~$0.01-0.05 per post with prompt + completion)
  - Image generation cost per post ($0.02-0.12 per image depending on model/quality)
  - Assume 3 posts/week, 2 image variations each = ~$0.40-$1.50/user/week in AI costs
  - At $29/month pricing, AI costs could be $1.60-$6.00/month/user (5-20% of revenue)
- Use tiered models: cheaper models for drafts, expensive models for final generation
- Cache and reuse: if a user likes a style, save the successful prompt/parameters
- Set generation caps per plan tier (e.g., free: 4 posts/month, pro: 12 posts/month)
- Implement prompt caching where supported (Anthropic, OpenAI) to reduce costs on repeated system prompts
- Track cost per user per month as a core business metric from Day 1

**Phase:** Phase 1 (MVP) must have cost tracking; Phase 2 must have cost optimization.
**Severity:** MEDIUM
**Confidence:** MEDIUM (costs depend on specific model choices and usage patterns)

---

### Pitfall 12: Image Generation Prompt Engineering Is an Ongoing Craft, Not a One-Time Setup

**What goes wrong:** Teams write initial image generation prompts, ship them, and assume they're done. In reality, image generation prompts need continuous refinement. Different content topics require different visual styles. Professional LinkedIn imagery has specific expectations (clean, business-appropriate, not too whimsical) that generic prompts don't capture.

**Prevention:**
- Build an internal prompt library organized by content type (thought leadership, product announcement, industry news, personal story, etc.)
- Include negative prompts / style restrictions: "no cartoonish elements, no watermarks, no text overlays" (text rendering in AI images is unreliable -- overlay text programmatically instead)
- A/B test prompt variations: track which image styles get higher engagement
- Store successful prompts per user as "style presets" that can be reused
- Separate image composition from text: generate clean background images and overlay text/branding programmatically using image processing libraries
- Review generated images across diverse brand types during testing -- what works for a tech startup looks wrong for a law firm

**Phase:** Phase 1 (MVP) needs a solid initial prompt library; ongoing refinement in every phase.
**Severity:** MEDIUM
**Confidence:** HIGH (well-documented challenge in AI image generation)

---

### Pitfall 13: LinkedIn Post Content Limits and Format Restrictions

**What goes wrong:** LinkedIn posts have character limits (~3,000 characters for organic posts), and the Posts API has specific restrictions on what content types can be organic vs. sponsored. For example: Carousels can ONLY be sponsored (not organic). MultiImage posts can only be non-sponsored. Polls can only be non-sponsored. These constraints limit what the AI can generate.

**Prevention:**
- Hard-code LinkedIn content constraints into the AI generation pipeline:
  - Max commentary length: validate before sending
  - Only generate content types that are supported for organic (personal) posts: text, single image, multi-image, article, poll
  - No organic carousel support via API
- Display character count in the editor with LinkedIn's limit
- If AI generates content that exceeds limits, truncate intelligently (don't cut mid-sentence)
- Test every content type variation against the actual API before shipping

**Phase:** Phase 1 (MVP).
**Severity:** MEDIUM
**Confidence:** HIGH (verified against LinkedIn Posts API docs)

**Source:** https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api

---

### Pitfall 14: User Trust Erosion from Autonomous Posting

**What goes wrong:** Users grant LinkedIn access to an automation tool, then worry about what it's posting. Any accidental post, wrong-tone post, or embarrassing AI output on their professional profile can cause immediate, permanent churn. LinkedIn is a professional reputation platform -- the stakes are higher than Instagram or Twitter.

**Prevention:**
- NEVER auto-publish without explicit user approval in MVP. Every post goes through a review step.
- Show a full preview that exactly matches how the post will appear on LinkedIn (including image)
- Add a "post review" email/notification before each scheduled post goes live (optional, user-configurable)
- Implement a "panic button" -- easy way to delete a recently published post from within BriefAgent
- Show a post history dashboard so users can see everything published on their behalf
- Start with a "suggestion" framing, not an "automation" framing: "We suggest this post for Tuesday" not "Your Tuesday post is scheduled"
- Add a clear "AI Generated" internal label so users remember they need to review

**Phase:** Phase 1 (MVP) -- approval flow is core, not a nice-to-have.
**Severity:** MEDIUM
**Confidence:** HIGH (common pattern in social media automation tools)

---

### Pitfall 15: LinkedIn Scope Change Invalidates All Previous Tokens

**What goes wrong:** Per LinkedIn's official documentation: "If you request a different scope than the previously granted scope, all the previous access tokens are invalidated." This means if you add a new permission to your app (e.g., adding `r_organization_social` after initially only having `w_member_social`), ALL existing user tokens become invalid. Every user must re-authenticate.

**Why it happens:** LinkedIn's OAuth implementation invalidates tokens when scope changes, unlike platforms where scope is additive.

**Consequences:**
- Adding new features that require new scopes forces ALL users to re-authenticate simultaneously
- If not handled gracefully, publishing stops for all users until they re-auth
- Support burden spikes when thousands of users simultaneously lose access

**Prevention:**
- Request ALL scopes you'll need in the foreseeable future during the initial OAuth flow
- Plan your permission roadmap upfront: what will you need for Phase 1, 2, 3?
- If you must add a scope, implement a gradual migration: detect the old scope on API calls, prompt users to re-auth with new scope, but keep old tokens working until they naturally expire
- Communicate scope changes proactively to users before deploying

**Phase:** Phase 1 (MVP) scope selection is a one-way door decision.
**Severity:** MEDIUM
**Confidence:** HIGH (verified in LinkedIn OAuth docs)

**Source:** https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow

---

## Minor Pitfalls

---

### Pitfall 16: Image URN Reuse and Download URL Expiration

**What goes wrong:** LinkedIn image download URLs have an expiration time (`downloadUrlExpiresAt`). If you store these URLs for preview purposes, they'll break. However, the image URN itself can be reused across posts. Developers often confuse the download URL (temporary, for previewing) with the image URN (permanent, for referencing in posts).

**Prevention:**
- Store image URNs, not download URLs
- If you need to display previews, also store the original generated image locally/in S3
- When displaying historical posts, fetch a fresh download URL via GET to the Images API if needed

**Phase:** Phase 1 (MVP).
**Severity:** LOW
**Confidence:** HIGH (verified in LinkedIn Images API docs)

---

### Pitfall 17: LinkedIn's Mention Matching Is Case-Sensitive and Must Be Exact

**What goes wrong:** When mentioning organizations in posts, the text must exactly match the organization's name on LinkedIn (case-sensitive). If it doesn't match, the mention renders as plain text, not a clickable link. Member mentions are more forgiving (matching on first name, last name, or full name), but organization mentions are strict.

**Prevention:**
- If the AI generates `@mentions`, validate them against LinkedIn's API before publishing
- For organization mentions, fetch the exact name via LinkedIn API and use it verbatim
- Consider not generating mentions in MVP -- they add complexity with minimal value for automated posts
- If mentions are needed, build a lookup/autocomplete against LinkedIn's API

**Phase:** Phase 2+ (mentions are a nice-to-have, not MVP).
**Severity:** LOW
**Confidence:** HIGH (verified in LinkedIn Posts API docs)

---

### Pitfall 18: Headless Browser Costs for Web Scraping

**What goes wrong:** If onboarding scraping requires a headless browser (Playwright/Puppeteer) for JavaScript-rendered sites, running these in production adds infrastructure complexity and cost. Headless browsers consume significant memory (~200-500MB per instance) and are slow (2-10 seconds per page).

**Prevention:**
- Use headless browsers only as a fallback, not the default path
- Run headless scraping as an async background job, not in the request path
- Consider using a scraping API service (e.g., Browserless, ScrapingBee) instead of self-hosting
- Set strict resource limits: kill browser instances after 15 seconds max
- Pre-scrape on onboarding and cache results -- never scrape on every page load

**Phase:** Phase 1 if web scraping is in MVP scope, otherwise Phase 2.
**Severity:** LOW
**Confidence:** MEDIUM (depends on implementation choices)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation | Severity |
|-------------|---------------|------------|----------|
| **Phase 1: LinkedIn Auth** | Token expiration without refresh token access (Pitfall 1) | Apply for MDP immediately; build token health monitoring | CRITICAL |
| **Phase 1: LinkedIn Auth** | Scope selection is a one-way door (Pitfall 15) | Request all foreseeable scopes upfront | MEDIUM |
| **Phase 1: Publishing** | Multi-step image upload failure (Pitfall 6) | Poll for AVAILABLE status before creating post | HIGH |
| **Phase 1: Publishing** | `little` text format parsing errors (Pitfall 8) | Build sanitizer for all AI output | HIGH |
| **Phase 1: Publishing** | Content format/character limit violations (Pitfall 13) | Validate constraints before API calls | MEDIUM |
| **Phase 1: Scheduling** | Timezone/DST bugs (Pitfall 9) | Store user timezone identifier, convert at execution time | HIGH |
| **Phase 1: Onboarding** | Website scraping failures (Pitfall 10) | Graceful degradation to manual input | HIGH |
| **Phase 1: AI Generation** | Generic, off-brand content (Pitfall 5) | Deep onboarding, voice profiling, human-in-the-loop | CRITICAL |
| **Phase 1: AI Images** | Non-deterministic, off-brand images (Pitfall 4) | Template system + variations + user selection | CRITICAL |
| **Phase 1: Trust** | Users fear autonomous posting (Pitfall 14) | Mandatory review before publish | MEDIUM |
| **Phase 2: Scale** | Rate limit exhaustion (Pitfall 7) | Spread posts, queue management, monitoring | HIGH |
| **Phase 2: Scale** | AI cost spirals (Pitfall 11) | Cost tracking, generation caps, model tiering | MEDIUM |
| **Phase 2: API** | Version sunset breaking publishing (Pitfall 3) | Abstraction layer, version monitoring | CRITICAL |
| **Ongoing** | Prompt engineering degradation (Pitfall 12) | Prompt library, A/B testing, per-user presets | MEDIUM |

---

## Summary: Top 5 Things to Get Right in MVP

1. **Token lifecycle management** -- LinkedIn OAuth is unforgiving. Build monitoring, refresh, and re-auth flows before anything else.
2. **Human-in-the-loop for all AI output** -- Never auto-publish. Users must review and approve every post and image. Trust is earned over months and lost in one bad post.
3. **LinkedIn API abstraction layer** -- Wrap all LinkedIn API calls behind a versioned service. Handle `little` text escaping, image upload lifecycle, and rate limiting centrally.
4. **Timezone-correct scheduling** -- Store user timezone, convert at execution time, test DST transitions explicitly.
5. **Cost tracking from Day 1** -- Track AI generation costs per user per month. Set caps. Build unit economics dashboards before you have 100 users.

---

## Sources

- LinkedIn 3-Legged OAuth Flow: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow (November 2025)
- LinkedIn Programmatic Refresh Tokens: https://learn.microsoft.com/en-us/linkedin/shared/authentication/programmatic-refresh-tokens (October 2025)
- LinkedIn Getting Access: https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access (June 2025)
- LinkedIn Posts API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api (November 2025)
- LinkedIn Images API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/images-api (February 2026)
- LinkedIn Rate Limits: https://learn.microsoft.com/en-us/linkedin/shared/api-guide/concepts/rate-limits (August 2025)
- LinkedIn `little` Text Format: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/little-text-format (October 2025)
