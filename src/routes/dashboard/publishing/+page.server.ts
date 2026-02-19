import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ parent }: { parent: () => Promise<{ product: { id: string } | null }> }) {
	const { product } = await parent();

	if (!product) {
		return {
			columns: [
				{ id: 'draft', posts: [], count: 0 },
				{ id: 'pending_review', posts: [], count: 0 },
				{ id: 'scheduled', posts: [], count: 0 },
				{ id: 'published', posts: [], count: 0 }
			],
			allPosts: []
		};
	}

	const allPosts = await db.query.posts.findMany({
		where: eq(posts.productId, product.id),
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
			hashtags: true,
			keyMessage: true,
			rejectionReason: true
		},
		orderBy: posts.scheduledAt
	});

	const serialized = allPosts.map((p) => ({
		...p,
		scheduledAt: p.scheduledAt?.toISOString() ?? null
	}));

	// Group by status. Rejected posts go into draft column for rework.
	const draft = serialized.filter((p) => p.status === 'draft' || p.status === 'rejected');
	const pendingReview = serialized.filter((p) => p.status === 'pending_review');
	const scheduled = serialized.filter(
		(p) => p.status === 'scheduled' || p.status === 'approved'
	);
	const published = serialized.filter((p) => p.status === 'published');

	return {
		columns: [
			{ id: 'draft', posts: draft, count: draft.length },
			{ id: 'pending_review', posts: pendingReview, count: pendingReview.length },
			{ id: 'scheduled', posts: scheduled, count: scheduled.length },
			{ id: 'published', posts: published, count: published.length }
		],
		allPosts: serialized
	};
};
