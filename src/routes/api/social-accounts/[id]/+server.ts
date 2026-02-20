import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { socialAccounts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = await locals.getUser();
	if (!user) throw error(401, 'Not authenticated');

	// Load the social account with its product to verify ownership
	const account = await db.query.socialAccounts.findFirst({
		where: eq(socialAccounts.id, params.id),
		with: { product: true }
	});

	if (!account || account.product.userId !== user.id) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	// Delete the social account
	await db.delete(socialAccounts).where(eq(socialAccounts.id, params.id));

	return json({ success: true });
};
