import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
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

	return { settingsProducts: allProducts };
};
