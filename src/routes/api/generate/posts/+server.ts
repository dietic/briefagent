import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationJobs, contentPlans, posts, products } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { generatePostsForPlan } from '$lib/server/ai/pipeline/post-generator';

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = await locals.getUser();
	if (!user) return error(401, 'Unauthorized');

	const body = await request.json();
	const contentPlanId = body?.contentPlanId;

	if (!contentPlanId || typeof contentPlanId !== 'string') {
		return error(400, 'contentPlanId is required');
	}

	// Verify content plan exists and belongs to user's product
	const contentPlan = await db.query.contentPlans.findFirst({
		where: eq(contentPlans.id, contentPlanId)
	});

	if (!contentPlan) {
		return error(404, 'Content plan not found');
	}

	const product = await db.query.products.findFirst({
		where: and(eq(products.id, contentPlan.productId!), eq(products.userId, user.id))
	});

	if (!product) {
		return error(403, 'Not authorized to access this content plan');
	}

	// Count posts to estimate total steps
	const planPosts = await db.query.posts.findMany({
		where: eq(posts.contentPlanId, contentPlanId),
		columns: { id: true, postType: true, contentData: true }
	});

	const imageSteps = planPosts.reduce((sum, p) => {
		if (p.postType === 'static_image') return sum + 1;
		if (p.postType === 'carousel') {
			const data = p.contentData as { carouselSlideCount?: number } | null;
			return sum + (data?.carouselSlideCount ?? 6);
		}
		return sum; // thread, poll, text_only = 0 image steps
	}, 0);
	const estimatedSteps = 2 + planPosts.length + imageSteps;

	// Create job record
	const [job] = await db
		.insert(generationJobs)
		.values({
			userId: user.id,
			productId: product.id,
			type: 'post_generation',
			status: 'pending',
			totalSteps: estimatedSteps
		})
		.returning();

	// Fire-and-forget the actual generation
	generatePostsForPlan(job.id, contentPlanId, product.id).catch((err) => {
		console.error('Post generation failed:', err);
	});

	return json({ jobId: job.id });
};
