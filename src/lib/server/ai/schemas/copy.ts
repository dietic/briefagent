import { z } from 'zod';

export const copyOutputSchema = z.object({
	hookLine: z.string().describe('Scroll-stopping first line that grabs attention'),
	body: z.string().describe('Value-driven body content, professional but human'),
	cta: z.string().describe('Goal-aligned call to action'),
	hashtags: z
		.array(z.string())
		.min(3)
		.max(5)
		.describe('Mix of popular and niche hashtags, without # prefix'),
	fullText: z
		.string()
		.describe(
			'Complete formatted LinkedIn post: hook + blank line + body + blank line + CTA + blank line + hashtags with #'
		)
});

export type CopyOutput = z.infer<typeof copyOutputSchema>;

// ── Carousel ────────────────────────────────────────────────────────

export const carouselCopySchema = z.object({
	slides: z.array(
		z.object({
			headline: z.string().describe('Bold headline, max 8 words'),
			body: z.string().describe('Supporting text, max 40 words')
		})
	),
	hashtags: z
		.array(z.string())
		.min(3)
		.max(5)
		.describe('Mix of popular and niche hashtags, without # prefix'),
	introText: z
		.string()
		.describe('LinkedIn post text displayed above the carousel. Hook + context + CTA to swipe.')
});

export type CarouselCopyOutput = z.infer<typeof carouselCopySchema>;

// ── Thread ──────────────────────────────────────────────────────────

export const threadCopySchema = z.object({
	tweets: z.array(
		z.object({
			text: z.string().describe('Tweet text, max 280 characters')
		})
	),
	hashtags: z
		.array(z.string())
		.min(1)
		.max(3)
		.describe('Hashtags for the last tweet, without # prefix')
});

export type ThreadCopyOutput = z.infer<typeof threadCopySchema>;

// ── Poll ────────────────────────────────────────────────────────────

export const pollCopySchema = z.object({
	question: z.string().describe('The poll question'),
	options: z
		.array(z.string().max(25))
		.min(2)
		.max(4)
		.describe('Poll answer options, each max 25 characters'),
	contextPost: z
		.string()
		.describe('Post text accompanying the poll — sets up context and encourages votes'),
	hashtags: z
		.array(z.string())
		.min(2)
		.max(4)
		.describe('Hashtags, without # prefix')
});

export type PollCopyOutput = z.infer<typeof pollCopySchema>;
