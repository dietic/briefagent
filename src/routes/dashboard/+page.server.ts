import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq, and, gte, lte, count } from 'drizzle-orm';
import { addDays, startOfDay } from 'date-fns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { product } = await parent();

	if (!product) {
		return { stats: null, upcoming: [], hasProduct: false };
	}

	// Stats query: aggregate counts by status
	const statusCounts = await db
		.select({ status: posts.status, count: count() })
		.from(posts)
		.where(eq(posts.productId, product.id))
		.groupBy(posts.status);

	const stats = {
		generated: statusCounts.reduce((sum, row) => sum + row.count, 0),
		approved: statusCounts.find((r) => r.status === 'approved')?.count ?? 0,
		pendingReview: statusCounts.find((r) => r.status === 'pending_review')?.count ?? 0,
		published: statusCounts.find((r) => r.status === 'published')?.count ?? 0,
		rejected: statusCounts.find((r) => r.status === 'rejected')?.count ?? 0
	};

	// Upcoming posts query: next 7 days
	const now = new Date();
	const upcoming = await db.query.posts.findMany({
		where: and(
			eq(posts.productId, product.id),
			gte(posts.scheduledAt, startOfDay(now)),
			lte(posts.scheduledAt, addDays(now, 7))
		),
		columns: {
			id: true,
			topic: true,
			status: true,
			scheduledAt: true,
			platform: true,
			postType: true
		},
		orderBy: posts.scheduledAt,
		limit: 10
	});

	return {
		stats,
		upcoming: upcoming.map((p) => ({
			...p,
			scheduledAt: p.scheduledAt?.toISOString() ?? null
		})),
		hasProduct: true
	};
};
