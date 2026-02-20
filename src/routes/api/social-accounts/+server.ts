import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { products, socialAccounts } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = await locals.getUser();
	if (!user) throw error(401, 'Not authenticated');

	const body = await request.json();
	const { productId, platform, handle, url } = body as {
		productId?: string;
		platform?: string;
		handle?: string;
		url?: string;
	};

	// Validate required fields
	if (!productId || !platform) {
		return json({ error: 'productId and platform are required' }, { status: 400 });
	}

	if (!handle && !url) {
		return json({ error: 'At least one of handle or url must be provided' }, { status: 400 });
	}

	// Verify product ownership
	const product = await db.query.products.findFirst({
		where: and(eq(products.id, productId), eq(products.userId, user.id))
	});

	if (!product) throw error(403, 'Product not found or not owned');

	// Insert social account
	const [created] = await db
		.insert(socialAccounts)
		.values({
			productId,
			platform,
			handle: handle || null,
			url: url || null
		})
		.returning();

	return json(created, { status: 201 });
};
