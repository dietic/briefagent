import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products, assets } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const product = await db.query.products.findFirst({
		where: eq(products.userId, user.id)
	});

	if (!product) {
		throw redirect(303, '/dashboard/onboarding/quick-start');
	}

	const productAssets = await db.query.assets.findMany({
		where: eq(assets.productId, product.id),
		orderBy: (assets, { desc }) => [desc(assets.createdAt)]
	});

	return { product, assets: productAssets };
};

export const actions: Actions = {
	finish: async ({ locals }) => {
		const user = await locals.getUser();
		if (!user) throw redirect(303, '/login');

		const product = await db.query.products.findFirst({
			where: eq(products.userId, user.id)
		});

		if (product) {
			await db
				.update(products)
				.set({ onboardingStep: 'complete', updatedAt: new Date() })
				.where(eq(products.id, product.id));
		}

		throw redirect(303, '/dashboard/onboarding/complete');
	}
};
