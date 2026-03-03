import { db } from '$lib/server/db';
import { productBriefs, contentPlans, posts } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { product } = await parent();

	if (!product) {
		return { brand: null, voice: null, contentPlans: [], stats: null };
	}

	// Load product brief for brand voice data
	const brief = await db.query.productBriefs.findFirst({
		where: eq(productBriefs.productId, product.id)
	});

	// Load content plans as "campaigns"
	const plans = await db.query.contentPlans.findMany({
		where: eq(contentPlans.productId, product.id),
		orderBy: contentPlans.createdAt
	});

	// Load post counts per content plan
	const planIds = plans.map((p) => p.id);
	const planStats: Record<string, { total: number; published: number }> = {};

	for (const planId of planIds) {
		const allPosts = await db
			.select({ count: count() })
			.from(posts)
			.where(eq(posts.contentPlanId, planId));
		const pubPosts = await db
			.select({ count: count() })
			.from(posts)
			.where(and(eq(posts.contentPlanId, planId), eq(posts.status, 'published')));

		planStats[planId] = {
			total: allPosts[0]?.count ?? 0,
			published: pubPosts[0]?.count ?? 0
		};
	}

	// Total stats
	const totalPostCount = await db
		.select({ count: count() })
		.from(posts)
		.where(eq(posts.productId, product.id));

	// Build brand profile from product data
	const brandAnalysis = product.brandAnalysis as Record<string, unknown> | null;

	const brand = {
		name: product.name,
		description: product.description ?? '',
		logoUrl: product.logoUrl ?? null,
		logoInitials: product.name
			.split(' ')
			.map((w: string) => w[0])
			.join('')
			.toUpperCase()
			.slice(0, 2),
		productType: product.productType ?? null,
		industry: brief?.industry ?? null,
		audience: brief?.idealCustomer ?? null,
		brandAnalysis
	};

	// Build voice data from brief
	const voice = brief
		? {
				personalityTraits: brief.personalityTraits ?? [],
				wordsToUse: brief.wordsToUse ?? [],
				wordsToAvoid: brief.wordsToAvoid ?? [],
				exampleContent: brief.exampleContent ?? null
			}
		: null;

	// Build campaigns from content plans
	const campaigns = plans.map((plan) => {
		const stats = planStats[plan.id] ?? { total: 0, published: 0 };
		const progress = stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0;
		return {
			id: plan.id,
			name: plan.summary ?? 'Content Plan',
			themes: plan.contentThemes ?? [],
			postsTotal: stats.total,
			postsPublished: stats.published,
			progress,
			createdAt: plan.createdAt?.toISOString() ?? null
		};
	});

	return {
		brand,
		voice,
		contentPlans: campaigns,
		stats: {
			totalPosts: totalPostCount[0]?.count ?? 0
		}
	};
};
