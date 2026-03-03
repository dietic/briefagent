import { db } from '$lib/server/db';
import { contentPlans, contentPillars, posts } from '$lib/server/db/schema';
import { eq, desc, asc, isNotNull, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { product } = await parent();

	if (!product) {
		return { product: null, existingPlans: [], pillars: [] };
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

	const pillars = await db.query.contentPillars.findMany({
		where: eq(contentPillars.productId, product.id),
		columns: { id: true, name: true },
		orderBy: [asc(contentPillars.sortOrder)],
		with: {
			pillarPlatforms: {
				columns: { platform: true }
			}
		}
	});

	return { product, existingPlans, pillars };
};
