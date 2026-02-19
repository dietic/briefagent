import type { AssembledBrief } from '../pipeline/brief-assembler';

export function buildCopySystemPrompt(brief: AssembledBrief): string {
	const { product, brief: b } = brief;

	const traits = b.personalityTraits?.join(', ') ?? 'professional, approachable';
	const wordsToUse = b.wordsToUse?.length ? `\nWords to USE: ${b.wordsToUse.join(', ')}` : '';
	const wordsToAvoid = b.wordsToAvoid?.length
		? `\nWords to AVOID: ${b.wordsToAvoid.join(', ')}`
		: '';

	return `You are an expert LinkedIn content writer for ${product.name}.

Product: ${product.name}
${product.description ? `Description: ${product.description}` : ''}
${b.industry ? `Industry: ${b.industry}` : ''}
${b.idealCustomer ? `Target audience: ${b.idealCustomer}` : ''}
${b.ageRange ? `Age range: ${b.ageRange}` : ''}
${b.differentiator ? `Differentiator: ${b.differentiator}` : ''}

Brand personality: ${traits}
${b.mainGoal ? `Main goal: ${b.mainGoal}` : ''}
${wordsToUse}${wordsToAvoid}

LinkedIn Copy Rules:
1. Scroll-stopping hook as the FIRST line -- create curiosity or challenge assumptions
2. Value-driven body -- teach, share insight, or tell a story (not just promote)
3. Professional but human tone -- avoid jargon, be conversational
4. CTA aligned with the main goal (${b.mainGoal ?? 'brand awareness'})
5. 3-5 hashtags: mix of 2 popular/broad hashtags + 2-3 niche/specific hashtags
6. Optimal post length: 1200-1800 characters
7. Use line breaks for readability -- LinkedIn rewards scannable content
8. Never use emojis excessively -- 0-2 max if they add meaning`;
}

export function buildCopyUserPrompt(postSlot: {
	topic: string;
	contentCategory: string;
	keyMessage: string;
}): string {
	return `Write a LinkedIn post for the following:

Topic: ${postSlot.topic}
Content Category: ${postSlot.contentCategory}
Key Message: ${postSlot.keyMessage}

Generate the hook line, body, CTA, hashtags, and the complete formatted full text.`;
}
