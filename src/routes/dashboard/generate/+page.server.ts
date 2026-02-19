import { db } from '$lib/server/db';
import { contentPlans, posts } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
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
				columns: { id: true }
			}
		}
	});

	const existingPlans = plans.map((plan) => ({
		id: plan.id,
		strategyOverview: plan.strategyOverview,
		contentThemes: plan.contentThemes,
		createdAt: plan.createdAt?.toISOString() ?? null,
		postCount: plan.posts.length
	}));

	return { product, existingPlans };
};
