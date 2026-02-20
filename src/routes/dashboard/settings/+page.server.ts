import { db } from '$lib/server/db';
import { products, socialAccounts } from '$lib/server/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const allProducts = await db.query.products.findMany({
		where: eq(products.userId, user.id),
		orderBy: desc(products.createdAt),
		columns: {
			id: true,
			name: true,
			logoUrl: true,
			websiteUrl: true,
			description: true,
			onboardingStep: true,
			productType: true,
			createdAt: true
		}
	});

	// Get social account counts per product
	const productIds = allProducts.map((p) => p.id);
	const accountCounts: Record<string, number> = {};
	for (const pid of productIds) {
		const result = await db
			.select({ count: count() })
			.from(socialAccounts)
			.where(eq(socialAccounts.productId, pid));
		accountCounts[pid] = result[0]?.count ?? 0;
	}

	return { settingsProducts: allProducts, socialAccountCounts: accountCounts };
};
