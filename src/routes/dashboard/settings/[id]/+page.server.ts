import { db } from '$lib/server/db';
import { products, productBriefs, contentPillars, contentPlans, pillarPlatforms } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent, params }) => {
	const { user } = await parent();

	const product = await db.query.products.findFirst({
		where: and(eq(products.id, params.id), eq(products.userId, user.id)),
		columns: {
			id: true,
			name: true,
			description: true,
			websiteUrl: true,
			productType: true,
			logoUrl: true,
			onboardingStep: true
		}
	});

	if (!product) {
		throw error(404, 'Product not found');
	}

	const brief = await db.query.productBriefs.findFirst({
		where: eq(productBriefs.productId, params.id)
	});

	const pillars = await db.query.contentPillars.findMany({
		where: eq(contentPillars.productId, params.id),
		orderBy: contentPillars.sortOrder,
		with: {
			pillarPlatforms: {
				columns: { platform: true }
			}
		}
	});

	const [planCountResult] = await db
		.select({ count: count() })
		.from(contentPlans)
		.where(eq(contentPlans.productId, params.id));

	return {
		settingsProduct: product,
		brief,
		pillars,
		planCount: planCountResult?.count ?? 0
	};
};

export const actions: Actions = {
	updateProduct: async ({ request, params, locals }) => {
		const user = await locals.getUser();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const websiteUrl = formData.get('websiteUrl') as string;

		if (!name?.trim()) {
			return fail(400, { error: 'Product name is required' });
		}

		// Verify ownership
		const product = await db.query.products.findFirst({
			where: and(eq(products.id, params.id), eq(products.userId, user.id))
		});

		if (!product) return fail(404, { error: 'Product not found' });

		await db
			.update(products)
			.set({
				name: name.trim(),
				description: description?.trim() || null,
				websiteUrl: websiteUrl?.trim() || null,
				updatedAt: new Date()
			})
			.where(eq(products.id, params.id));

		return { success: true };
	},

	updatePlatforms: async ({ request, params, locals }) => {
		const user = await locals.getUser();
		if (!user) return fail(401, { error: 'Unauthorized' });

		// Check that no plans exist (platforms are locked if plans exist)
		const [planCountResult] = await db
			.select({ count: count() })
			.from(contentPlans)
			.where(eq(contentPlans.productId, params.id));

		if ((planCountResult?.count ?? 0) > 0) {
			return fail(400, { error: 'Cannot change platforms after plans are generated' });
		}

		const product = await db.query.products.findFirst({
			where: and(eq(products.id, params.id), eq(products.userId, user.id))
		});

		if (!product) return fail(404, { error: 'Product not found' });

		const formData = await request.formData();
		const platformsRaw = formData.get('pillarPlatforms') as string;

		let platformData: Array<{ pillarId: string; platforms: string[] }> = [];
		try {
			platformData = JSON.parse(platformsRaw || '[]');
		} catch {
			return fail(400, { error: 'Invalid platform data' });
		}

		const activeSlugs = new Set(['linkedin', 'x']);

		// For each pillar, delete existing junction rows and re-insert
		for (const entry of platformData) {
			await db.delete(pillarPlatforms).where(eq(pillarPlatforms.pillarId, entry.pillarId));

			const validPlatforms = entry.platforms.filter((p) => activeSlugs.has(p));
			if (validPlatforms.length > 0) {
				await db
					.insert(pillarPlatforms)
					.values(validPlatforms.map((platform) => ({ pillarId: entry.pillarId, platform })));
			}
		}

		return { success: true };
	}
};
