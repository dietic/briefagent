import { db } from '$lib/server/db';
import { contentPlans, posts } from '$lib/server/db/schema';
import { eq, desc, isNotNull, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { product } = await parent();

	if (!product) {
		return { product: null, existingPlans: [] };
	}

	const plans = await db.query.contentPlans.findMany({
		where: eq(contentPlans.productId, product.id),
		orderBy: desc(contentPlans.createdAt),
		limit: 5,
		with: {
			posts: {
				columns: { id: true, copyText: true, postType: true }
			}
		}
	});

	const existingPlans = plans.map((plan) => ({
		id: plan.id,
		strategyOverview: plan.strategyOverview,
		contentThemes: plan.contentThemes,
		createdAt: plan.createdAt?.toISOString() ?? null,
		postCount: plan.posts.length,
		postsGenerated: plan.posts.some((p) => p.copyText !== null),
		generatedPostCount: plan.posts.filter((p) => p.copyText !== null).length
	}));

	return { product, existingPlans };
};
