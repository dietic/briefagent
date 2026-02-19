import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { generationJobs, contentPlans, posts, products } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { assembleBrief } from '$lib/server/ai/pipeline/brief-assembler';
import { generateContentPlan } from '$lib/server/ai/pipeline/plan-generator';

async function updateJob(jobId: string, updates: Record<string, unknown>) {
	await db
		.update(generationJobs)
		.set({ ...updates, updatedAt: new Date() })
		.where(eq(generationJobs.id, jobId));
}

async function runPlanGeneration(jobId: string, userId: string, productId: string) {
	try {
		// Step 1: Assemble brief
		await updateJob(jobId, { status: 'running', currentStep: 1, progress: 'Assembling brief...' });
		const brief = await assembleBrief(productId);

		// Step 2: Generate content plan
		await updateJob(jobId, { currentStep: 2, progress: 'Generating content plan...' });
		const previousPlans = await db.query.contentPlans.findMany({
			where: eq(contentPlans.productId, productId),
			columns: { summary: true, contentThemes: true }
		});
		const summaries = previousPlans
			.map((p) => {
				const themes = p.contentThemes?.join(', ') ?? '';
				return p.summary ? `${p.summary} (themes: ${themes})` : themes;
			})
			.filter(Boolean);

		const plan = await generateContentPlan(brief, summaries);

		// Step 3: Save to database
		await updateJob(jobId, { currentStep: 3, progress: 'Saving content plan...' });

		const summaryText =
			plan.strategyOverview.slice(0, 200) + ' | Themes: ' + plan.contentThemes.join(', ');

		const [contentPlan] = await db
			.insert(contentPlans)
			.values({
				productId,
				strategyOverview: plan.strategyOverview,
				contentThemes: plan.contentThemes,
				summary: summaryText
			})
			.returning();

		// Insert all post slots
		await db.insert(posts).values(
			plan.postSlots.map((slot) => ({
				contentPlanId: contentPlan.id,
				productId,
				platform: slot.platform,
				postType: slot.postType,
				scheduledAt: new Date(slot.dateTime),
				topic: slot.topic,
				contentCategory: slot.contentCategory,
				keyMessage: slot.keyMessage,
				assetReferences: slot.assetReferences
			}))
		);

		await updateJob(jobId, {
			status: 'completed',
			progress: 'Done!',
			resultId: contentPlan.id
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		console.error('Plan generation failed:', err);
		await updateJob(jobId, {
			status: 'failed',
			error: message,
			progress: 'Generation failed'
		});
	}
}

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = await locals.getUser();
	if (!user) return error(401, 'Unauthorized');

	const body = await request.json();
	const productId = body?.productId;

	if (!productId || typeof productId !== 'string') {
		return error(400, 'productId is required');
	}

	// Verify product belongs to user
	const product = await db.query.products.findFirst({
		where: and(eq(products.id, productId), eq(products.userId, user.id))
	});

	if (!product) {
		return error(404, 'Product not found');
	}

	// Create job record
	const [job] = await db
		.insert(generationJobs)
		.values({
			userId: user.id,
			productId,
			type: 'content_plan',
			status: 'pending',
			totalSteps: 3
		})
		.returning();

	// Fire-and-forget the actual generation
	runPlanGeneration(job.id, user.id, productId).catch((err) => {
		console.error('Plan generation failed:', err);
	});

	return json({ jobId: job.id });
};
