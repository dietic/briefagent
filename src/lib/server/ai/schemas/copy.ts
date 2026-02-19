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
