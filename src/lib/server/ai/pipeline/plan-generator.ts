import { generateObject } from 'ai';
import { planModel } from '../providers';
import { createContentPlanSchema, type ContentPlan } from '../schemas/plan';
import { buildPlanSystemPrompt, buildPlanUserPrompt } from '../prompts/plan-system';
import type { AssembledBrief } from './brief-assembler';
import { addDays, formatISO } from 'date-fns';

export async function generateContentPlan(
	brief: AssembledBrief,
	previousPlanSummaries: string[],
	startDate?: string,
	minPosts = 8,
	maxPosts = 12
): Promise<ContentPlan> {
	const resolvedStartDate = startDate ?? formatISO(addDays(new Date(), 1), { representation: 'date' });

	// Calculate post count based on pillar-platform combinations
	if (brief.contentPillars.length > 0) {
		const totalPillarPosts = brief.contentPillars.reduce(
			(sum, p) => sum + Math.max(1, p.platforms.length), 0
		);
		minPosts = Math.max(4, totalPillarPosts);
		maxPosts = Math.min(20, Math.max(minPosts, Math.ceil(totalPillarPosts * 1.5)));
	}

	const schema = createContentPlanSchema(minPosts, maxPosts);
	const systemPrompt = buildPlanSystemPrompt(minPosts, maxPosts);
	const userPrompt = buildPlanUserPrompt(brief, previousPlanSummaries, resolvedStartDate);

	const { object: plan } = await generateObject({
		model: planModel,
		schema,
		system: systemPrompt,
		prompt: userPrompt
	});

	// Validate 30% promotional cap
	const promoCount = plan.postSlots.filter((s) => s.contentCategory === 'promotional').length;
	const promoRatio = promoCount / plan.postSlots.length;

	if (promoRatio > 0.3) {
		// Retry once with stricter prompt
		const strictUserPrompt =
			userPrompt +
			'\n\nIMPORTANT: Your previous attempt had too many promotional posts (' +
			promoCount +
			'/' +
			plan.postSlots.length +
			'). Ensure promotional content is 30% or less.';

		const { object: retryPlan } = await generateObject({
			model: planModel,
			schema,
			system: systemPrompt,
			prompt: strictUserPrompt
		});

		const retryPromoCount = retryPlan.postSlots.filter(
			(s) => s.contentCategory === 'promotional'
		).length;
		const retryPromoRatio = retryPromoCount / retryPlan.postSlots.length;

		if (retryPromoRatio <= 0.3) {
			return retryPlan;
		}

		// If second attempt also fails, manually reassign excess promotional posts
		const maxPromo = Math.floor(retryPlan.postSlots.length * 0.3);
		let promoSeen = 0;
		const fixedSlots = retryPlan.postSlots.map((slot) => {
			if (slot.contentCategory === 'promotional') {
				promoSeen++;
				if (promoSeen > maxPromo) {
					return { ...slot, contentCategory: 'educational' as const };
				}
			}
			return slot;
		});

		return { ...retryPlan, postSlots: fixedSlots };
	}

	return plan;
}
