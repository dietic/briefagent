import { z } from 'zod';

export const contentCategoryZodEnum = z.enum([
	'educational',
	'promotional',
	'social_proof',
	'behind_the_scenes',
	'engagement',
	'tips',
	'announcement',
	'storytelling'
]);

export const postSlotSchema = z.object({
	dateTime: z
		.string()
		.describe('ISO 8601 date-time for publication, e.g. 2026-03-01T09:00:00Z'),
	platform: z.enum(['linkedin', 'x']),
	postType: z.enum(['static_image', 'text_only']),
	topic: z.string().describe('Specific angle or topic for this post'),
	contentCategory: contentCategoryZodEnum,
	keyMessage: z.string().describe('Core message this post should convey'),
	assetReferences: z
		.array(z.string())
		.describe('IDs of brand assets to reference, empty array if none')
});

export const contentPlanSchema = z.object({
	strategyOverview: z
		.string()
		.describe('2-3 paragraph strategic overview of the content approach'),
	contentThemes: z
		.array(z.string())
		.min(3)
		.max(5)
		.describe('3-5 overarching themes'),
	postSlots: z
		.array(postSlotSchema)
		.min(8)
		.max(12)
		.describe('8-12 post slots for 2-week period')
});

export type ContentPlan = z.infer<typeof contentPlanSchema>;
export type PostSlot = z.infer<typeof postSlotSchema>;
