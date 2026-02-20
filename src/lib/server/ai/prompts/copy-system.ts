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

	return `You are an expert ${spec.displayName} content writer for ${product.name}.

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
1. Scroll-stopping hook as the FIRST line -- create curiosity or challenge assumptions
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
