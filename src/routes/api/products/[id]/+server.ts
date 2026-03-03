import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals, cookies }) => {
	const user = await locals.getUser();
	if (!user) throw error(401, 'Not authenticated');

	// Verify ownership
	const product = await db.query.products.findFirst({
		where: and(eq(products.id, params.id), eq(products.userId, user.id))
	});

	if (!product) throw error(404, 'Product not found');

	// Delete product (cascade handles briefs, assets, posts, plans, jobs)
	await db.delete(products).where(eq(products.id, params.id));

	// If the deleted product was the active one, clear the cookie
	const activeId = cookies.get('active-product-id');
	if (activeId === params.id) {
		cookies.delete('active-product-id', { path: '/' });
	}

	return new Response(null, { status: 204 });
};
