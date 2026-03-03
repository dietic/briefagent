import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	const user = await locals.getUser();
	if (!user) throw error(401, 'Unauthorized');

	const { productId } = await request.json();
	if (!productId) throw error(400, 'Missing productId');

	const product = await db.query.products.findFirst({
		where: and(eq(products.id, productId), eq(products.userId, user.id))
	});

	if (!product) throw error(404, 'Product not found');

	cookies.set('active-product-id', productId, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		httpOnly: false,
		secure: false,
		sameSite: 'lax'
	});

	return json({ success: true });
};
