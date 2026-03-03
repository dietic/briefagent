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
	postType: z.enum(['static_image', 'text_only', 'carousel', 'thread', 'poll']),
	topic: z.string().describe('Specific angle or topic for this post'),
	contentCategory: contentCategoryZodEnum,
	keyMessage: z.string().describe('Core message this post should convey'),
	assetReferences: z
		.array(z.string())
		.describe('IDs of brand assets to reference, empty array if none'),
	carouselSlideCount: z
		.number()
		.min(4)
		.max(10)
		.nullable()
		.describe('Number of slides for carousel posts (4-10). Set when postType is carousel, null otherwise.'),
	threadTweetCount: z
		.number()
		.min(2)
		.max(10)
		.nullable()
		.describe('Number of tweets for thread posts (2-10). Set when postType is thread, null otherwise.'),
	pollOptions: z
		.array(z.string())
		.min(2)
		.max(4)
		.nullable()
		.describe('Poll answer options (2-4). Set when postType is poll, null otherwise.')
});

export function createContentPlanSchema(minPosts = 8, maxPosts = 12) {
	return z.object({
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
			.min(minPosts)
			.max(maxPosts)
			.describe(`${minPosts}-${maxPosts} post slots for 2-week period`)
	});
}

export const contentPlanSchema = createContentPlanSchema();

export type ContentPlan = z.infer<typeof contentPlanSchema>;
export type PostSlot = z.infer<typeof postSlotSchema>;
