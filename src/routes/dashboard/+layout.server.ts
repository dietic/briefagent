import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = await locals.getUser();
	if (!user) throw redirect(303, '/login');

	const product = await db.query.products.findFirst({
		where: eq(products.userId, user.id)
	});

	return { user, product: product ?? null };
};
