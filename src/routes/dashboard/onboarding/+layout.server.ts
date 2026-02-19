import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const product = await db.query.products.findFirst({
		where: eq(products.userId, user.id)
	});

	return { product: product ?? null };
};
