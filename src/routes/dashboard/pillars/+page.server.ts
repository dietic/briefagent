import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { contentPillars, pillarPlatforms, products } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { product } = await parent();

	if (!product) {
		return { pillars: [], hasProduct: false };
	}

	const pillars = await db.query.contentPillars.findMany({
		where: eq(contentPillars.productId, product.id),
		orderBy: [asc(contentPillars.sortOrder)],
		with: {
			pillarPlatforms: {
				columns: { platform: true }
			}
		}
	});

	return { pillars, hasProduct: true };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user) throw redirect(303, '/login');

		// Get the user's product
		const product = await db.query.products.findFirst({
			where: eq(products.userId, user.id)
		});

		if (!product) return fail(400, { error: 'No product found' });

		const formData = await request.formData();
		const pillarsRaw = formData.get('pillars') as string;

		let pillarItems: Array<{ name: string; description: string; platforms: string[] }> = [];
		try {
			pillarItems = JSON.parse(pillarsRaw || '[]');
		} catch {
			pillarItems = [];
		}

		// Filter out empty pillar names
		pillarItems = pillarItems.filter((p) => p.name.trim());

		// Delete existing pillars (cascade deletes junction rows)
		await db.delete(contentPillars).where(eq(contentPillars.productId, product.id));

		// Insert new pillars
		if (pillarItems.length > 0) {
			const insertedPillars = await db
				.insert(contentPillars)
				.values(
					pillarItems.map((p, i) => ({
						productId: product.id,
						name: p.name.trim(),
						description: p.description?.trim() || null,
						sortOrder: i
					}))
				)
				.returning();

			// Insert junction rows for platforms
			const activeSlugs = new Set(['linkedin', 'x']);
			const junctionRows = insertedPillars.flatMap((pillar, i) =>
				(pillarItems[i].platforms || [])
					.filter((platform: string) => activeSlugs.has(platform))
					.map((platform: string) => ({
						pillarId: pillar.id,
						platform
					}))
			);
			if (junctionRows.length > 0) {
				await db.insert(pillarPlatforms).values(junctionRows);
			}
		}

		return { success: true };
	}
};
