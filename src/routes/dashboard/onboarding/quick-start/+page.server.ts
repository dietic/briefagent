import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { user } = await parent();
	const isNew = url.searchParams.get('new') === '1';

	if (isNew) {
		return { product: null };
	}

	const product = await db.query.products.findFirst({
		where: eq(products.userId, user.id)
	});

	return { product: product ?? null };
};

export const actions: Actions = {
	default: async ({ request, locals, url, cookies }) => {
		const user = await locals.getUser();
		if (!user) throw redirect(303, '/login');

		const isNew = url.searchParams.get('new') === '1';
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const websiteUrl = (formData.get('websiteUrl') as string) || null;
		const description = (formData.get('description') as string) || null;
		const productType = (formData.get('productType') as string) || null;

		if (!name || !name.trim()) {
			return fail(400, { error: 'Product name is required', name, websiteUrl, description });
		}

		if (isNew) {
			const [created] = await db
				.insert(products)
				.values({
					userId: user.id,
					name: name.trim(),
					productType,
					websiteUrl,
					description,
					onboardingStep: 'deep_brief'
				})
				.returning({ id: products.id });

			cookies.set('active-product-id', created.id, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				httpOnly: false,
				secure: false,
				sameSite: 'lax'
			});

			throw redirect(303, '/dashboard/onboarding/deep-brief');
		}

		// Default: update existing or create first product
		const existing = await db.query.products.findFirst({
			where: eq(products.userId, user.id)
		});

		if (existing) {
			await db
				.update(products)
				.set({
					name: name.trim(),
					productType,
					websiteUrl,
					description,
					onboardingStep: 'deep_brief',
					updatedAt: new Date()
				})
				.where(eq(products.id, existing.id));

			cookies.set('active-product-id', existing.id, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				httpOnly: false,
				secure: false,
				sameSite: 'lax'
			});
		} else {
			const [created] = await db
				.insert(products)
				.values({
					userId: user.id,
					name: name.trim(),
					productType,
					websiteUrl,
					description,
					onboardingStep: 'deep_brief'
				})
				.returning({ id: products.id });

			cookies.set('active-product-id', created.id, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				httpOnly: false,
				secure: false,
				sameSite: 'lax'
			});
		}

		throw redirect(303, '/dashboard/onboarding/deep-brief');
	}
};
