import type { AssembledBrief } from '../pipeline/brief-assembler';
import { getPlatformSpec } from '../platform-specs';

export function buildCopySystemPrompt(brief: AssembledBrief, platform: string | null): string {
	const { product, brief: b } = brief;
	const spec = getPlatformSpec(platform);

	const traits = b.personalityTraits?.join(', ') ?? 'professional, approachable';
	const wordsToUse = b.wordsToUse?.length ? `\nWords to USE: ${b.wordsToUse.join(', ')}` : '';
	const wordsToAvoid = b.wordsToAvoid?.length
		? `\nWords to AVOID: ${b.wordsToAvoid.join(', ')}`
		: '';

	const platformExtras =
		spec.slug === 'x'
			? `\n7. Be concise -- every word must earn its place\n8. Consider thread format for complex topics (but output as single post for now)`
			: `\n7. Use line breaks for readability -- LinkedIn rewards scannable content\n8. Never use emojis excessively -- 0-2 max if they add meaning`;

	return `You are a senior ${spec.displayName} copywriter for ${product.name}. You write content that sounds like a real human with strong opinions — not a brand account.

Product: ${product.name}
${product.description ? `Description: ${product.description}` : ''}
${b.industry ? `Industry: ${b.industry}` : ''}
${b.idealCustomer ? `Target audience: ${b.idealCustomer}` : ''}
${b.ageRange ? `Age range: ${b.ageRange}` : ''}
${b.differentiator ? `Differentiator: ${b.differentiator}` : ''}

Brand personality: ${traits}
${b.mainGoal ? `Main goal: ${b.mainGoal}` : ''}
${wordsToUse}${wordsToAvoid}

${spec.displayName} Copy Rules:
1. Never start with a question. Start with a bold claim, a surprising stat, or a counterintuitive insight.
2. Value-driven body -- teach, share insight, or tell a story (not just promote)
3. ${spec.toneGuidelines}
4. CTA aligned with the main goal (${b.mainGoal ?? 'brand awareness'})
5. ${spec.hashtagRules}
6. Optimal post length: ${spec.charRecommended.min}-${spec.charRecommended.max} characters (hard limit: ${spec.charLimit})${platformExtras}`;
}

export function buildCopyUserPrompt(
	postSlot: {
		topic: string;
		contentCategory: string;
		keyMessage: string;
	},
	platform: string | null
): string {
	const spec = getPlatformSpec(platform);

	return `Write a ${spec.displayName} post for the following:

Topic: ${postSlot.topic}
Content Category: ${postSlot.contentCategory}
Key Message: ${postSlot.keyMessage}

Generate the hook line, body, CTA, hashtags, and the complete formatted full text.`;
}

// ── Carousel Copy Prompt ────────────────────────────────────────────

export function buildCarouselCopyPrompt(
	postSlot: { topic: string; contentCategory: string; keyMessage: string },
	slideCount: number,
	platform: string | null
): string {
	const spec = getPlatformSpec(platform);

	return `Generate a ${slideCount}-slide ${spec.displayName} carousel for the following:

Topic: ${postSlot.topic}
Content Category: ${postSlot.contentCategory}
Key Message: ${postSlot.keyMessage}

Rules:
- Slide 1 is the hook/cover: bold attention-grabbing headline that makes people stop scrolling.
- Slides 2-${slideCount - 1}: deliver value. Each slide has a bold headline (max 8 words) and supporting body text (max 40 words).
- Slide ${slideCount} is the CTA: tell readers what to do next.
- Add swipe prompts between slides (e.g., "Swipe →" or "Keep going →") integrated naturally.
- Include introText: the ${spec.displayName} post text that appears above the carousel (hook + CTA to swipe).
- Include 3-5 hashtags.`;
}

// ── Thread Copy Prompt ──────────────────────────────────────────────

export function buildThreadCopyPrompt(
	postSlot: { topic: string; contentCategory: string; keyMessage: string },
	tweetCount: number,
	platform: string | null
): string {
	return `Generate a ${tweetCount}-tweet X/Twitter thread for the following:

Topic: ${postSlot.topic}
Content Category: ${postSlot.contentCategory}
Key Message: ${postSlot.keyMessage}

Rules:
- Tweet 1 is the hook: must grab attention and make people want to read the rest.
- Each tweet must be under 280 characters and stand alone while building on the previous.
- Last tweet: CTA + relevant hashtags.
- Use "🧵" in tweet 1 to signal it's a thread.
- Include 1-3 hashtags for the last tweet only.`;
}

// ── Poll Copy Prompt ────────────────────────────────────────────────

export function buildPollCopyPrompt(
	postSlot: { topic: string; contentCategory: string; keyMessage: string },
	pollOptions: string[] | undefined,
	platform: string | null
): string {
	const spec = getPlatformSpec(platform);
	const optionsHint = pollOptions?.length
		? `\nSuggested options: ${pollOptions.join(', ')}`
		: '';

	return `Generate an engaging ${spec.displayName} poll for the following:

Topic: ${postSlot.topic}
Content Category: ${postSlot.contentCategory}
Key Message: ${postSlot.keyMessage}${optionsHint}

Rules:
- The poll question must be clear, concise, and drive engagement.
- Provide 2-4 concrete, mutually exclusive options (each max 25 characters).
- Include contextPost: the post text that accompanies the poll (sets up context, shares an opinion, encourages votes).
- The contextPost should NOT repeat the question — it should add perspective.
- Include 2-4 hashtags.`;
}
