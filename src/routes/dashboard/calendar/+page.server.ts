import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { startOfMonth, endOfMonth } from 'date-fns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { product } = await parent();

	const now = new Date();
	let year = now.getFullYear();
	let month = now.getMonth();

	const monthParam = url.searchParams.get('month');
	if (monthParam) {
		const [y, m] = monthParam.split('-').map(Number);
		if (y && m && m >= 1 && m <= 12) {
			year = y;
			month = m - 1;
		}
	}

	if (!product) {
		return { posts: [], year, month };
	}

	const targetDate = new Date(year, month, 1);
	const monthStart = startOfMonth(targetDate);
	const monthEnd = endOfMonth(targetDate);

	const calendarPosts = await db.query.posts.findMany({
		where: and(
			eq(posts.productId, product.id),
			gte(posts.scheduledAt, monthStart),
			lte(posts.scheduledAt, monthEnd)
		),
		columns: {
			id: true,
			topic: true,
			status: true,
			scheduledAt: true,
			platform: true,
			postType: true,
			imageUrl: true,
			contentCategory: true,
			copyText: true,
			hashtags: true
		},
		orderBy: posts.scheduledAt
	});

	return {
		posts: calendarPosts.map((p) => ({
			...p,
			scheduledAt: p.scheduledAt?.toISOString() ?? null
		})),
		year,
		month
	};
};
