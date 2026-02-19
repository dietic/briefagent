import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { assets, products } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * Verify that the asset belongs to the authenticated user's product.
 */
async function verifyOwnership(assetId: string, userId: string) {
	const result = await db
		.select({ asset: assets, product: products })
		.from(assets)
		.innerJoin(products, eq(assets.productId, products.id))
		.where(and(eq(assets.id, assetId), eq(products.userId, userId)))
		.limit(1);

	if (result.length === 0) return null;
	return result[0];
}

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const user = await locals.getUser();
	if (!user) throw error(401, 'Not authenticated');

	const owned = await verifyOwnership(params.id, user.id);
	if (!owned) throw error(404, 'Asset not found');

	const body = await request.json();
	const updates: Record<string, unknown> = {};

	if ('tag' in body) updates.tag = body.tag;
	if ('description' in body) updates.description = body.description;
	if ('isPrimary' in body) updates.isPrimary = body.isPrimary;

	if (Object.keys(updates).length === 0) {
		return json(owned.asset);
	}

	const [updated] = await db
		.update(assets)
		.set(updates)
		.where(eq(assets.id, params.id))
		.returning();

	return json(updated);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = await locals.getUser();
	if (!user) throw error(401, 'Not authenticated');

	const owned = await verifyOwnership(params.id, user.id);
	if (!owned) throw error(404, 'Asset not found');

	// Extract storage path from fileUrl
	// The URL pattern is: https://<project>.supabase.co/storage/v1/object/public/assets/<path>
	const url = owned.asset.fileUrl;
	const storagePrefix = '/storage/v1/object/public/assets/';
	const pathIndex = url.indexOf(storagePrefix);
	if (pathIndex !== -1) {
		const storagePath = url.substring(pathIndex + storagePrefix.length);
		try {
			await locals.supabase.storage.from('assets').remove([storagePath]);
		} catch {
			// Storage removal failed -- still delete DB record
		}
	}

	await db.delete(assets).where(eq(assets.id, params.id));

	return new Response(null, { status: 204 });
};
