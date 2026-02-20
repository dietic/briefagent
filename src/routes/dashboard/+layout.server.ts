import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const user = await locals.getUser();
	if (!user) throw redirect(303, '/login');

	const allProducts = await db.query.products.findMany({
		where: eq(products.userId, user.id),
		orderBy: desc(products.updatedAt)
	});

	const activeId = cookies.get('active-product-id');
	let product = allProducts.find((p) => p.id === activeId) ?? allProducts[0] ?? null;

	const slimProducts = allProducts.map((p) => ({
		id: p.id,
		name: p.name,
		logoUrl: p.logoUrl,
		onboardingStep: p.onboardingStep,
		productType: p.productType
	}));

	return { user, product, products: slimProducts };
};
