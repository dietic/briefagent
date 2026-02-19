import { db } from '$lib/server/db';
import { posts, contentPlans } from '$lib/server/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { product } = await parent();

	if (!product) {
		return { post: null, contentPlan: null };
	}

	const postId = url.searchParams.get('postId');

	let post;

	if (postId) {
		// Load a specific post by ID
		post = await db.query.posts.findFirst({
			where: and(eq(posts.id, postId), eq(posts.productId, product.id))
		});
	} else {
		// Load the most recent post in pending_review or draft status
		post = await db.query.posts.findFirst({
			where: and(
				eq(posts.productId, product.id),
				or(eq(posts.status, 'pending_review'), eq(posts.status, 'draft'))
			),
			orderBy: desc(posts.updatedAt)
		});
	}

	if (!post) {
		return { post: null, contentPlan: null };
	}

	// Load the associated content plan for context
	let contentPlan = null;
	if (post.contentPlanId) {
		contentPlan = await db.query.contentPlans.findFirst({
			where: eq(contentPlans.id, post.contentPlanId)
		});
	}

	return {
		post: {
			...post,
			scheduledAt: post.scheduledAt?.toISOString() ?? null,
			createdAt: post.createdAt?.toISOString() ?? null,
			updatedAt: post.updatedAt?.toISOString() ?? null,
			publishedAt: post.publishedAt?.toISOString() ?? null
		},
		contentPlan: contentPlan
			? {
					id: contentPlan.id,
					strategyOverview: contentPlan.strategyOverview,
					contentThemes: contentPlan.contentThemes,
					summary: contentPlan.summary
				}
			: null
	};
};
