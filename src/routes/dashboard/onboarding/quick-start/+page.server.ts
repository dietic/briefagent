import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const product = await db.query.products.findFirst({
		where: eq(products.userId, user.id)
	});

	return { product: product ?? null };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user) throw redirect(303, '/login');

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const websiteUrl = (formData.get('websiteUrl') as string) || null;
		const description = (formData.get('description') as string) || null;

		if (!name || !name.trim()) {
			return fail(400, { error: 'Product name is required', name, websiteUrl, description });
		}

		// Check if product already exists for this user
		const existing = await db.query.products.findFirst({
			where: eq(products.userId, user.id)
		});

		if (existing) {
			await db
				.update(products)
				.set({
					name: name.trim(),
					websiteUrl,
					description,
					onboardingStep: 'deep_brief',
					updatedAt: new Date()
				})
				.where(eq(products.id, existing.id));
		} else {
			await db.insert(products).values({
				userId: user.id,
				name: name.trim(),
				websiteUrl,
				description,
				onboardingStep: 'deep_brief'
			});
		}

		throw redirect(303, '/dashboard/onboarding/deep-brief');
	}
};
