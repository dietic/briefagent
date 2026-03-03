import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { contentPlans, posts, products } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { supabaseAdmin } from '$lib/server/supabase-admin';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = await locals.getUser();
	if (!user) throw error(401, 'Not authenticated');

	const plan = await db.query.contentPlans.findFirst({
		where: eq(contentPlans.id, params.id),
		with: { product: true }
	});

	if (!plan || !plan.product || plan.product.userId !== user.id) {
		throw error(404, 'Content plan not found');
	}

	// Clean up Supabase storage images for all posts in this plan
	const planPosts = await db.query.posts.findMany({
		where: eq(posts.contentPlanId, params.id),
		columns: { id: true, imageUrl: true, productId: true }
	});

	for (const post of planPosts) {
		if (post.imageUrl && post.productId) {
			const folder = `${post.productId}/${post.id}`;
			const { data: files } = await supabaseAdmin.storage
				.from('generated-images')
				.list(folder);
			if (files && files.length > 0) {
				await supabaseAdmin.storage
					.from('generated-images')
					.remove(files.map((f) => `${folder}/${f.name}`));
			}
		}
	}

	// Delete plan (CASCADE handles post deletion)
	await db.delete(contentPlans).where(eq(contentPlans.id, params.id));

	return new Response(null, { status: 204 });
};
