import { generatePostCopy } from './copy-generator';
import { generatePostImage } from './image-generator';
import { getCachedBrandAnalysis } from './brand-analyzer';
import { assembleBrief } from './brief-assembler';
import type { BrandAnalysis } from '../schemas/brand-analysis';
import { db } from '$lib/server/db';
import { posts, generationJobs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

async function updateJob(jobId: string, updates: Record<string, unknown>) {
	await db
		.update(generationJobs)
		.set({ ...updates, updatedAt: new Date() })
		.where(eq(generationJobs.id, jobId));
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generatePostsForPlan(
	jobId: string,
	contentPlanId: string,
	productId: string
): Promise<void> {
	try {
		// Step 1: Assemble brief
		await updateJob(jobId, { status: 'running', currentStep: 1, progress: 'Assembling brief...' });
		const brief = await assembleBrief(productId);

		// Step 2: Analyze brand assets
		await updateJob(jobId, { currentStep: 2, progress: 'Analyzing brand assets...' });

		const imageAssets = brief.assets
			.filter((a) => a.tag !== 'testimonial')
			.map((a) => a.fileUrl);

		let brandAnalysis: BrandAnalysis;
		if (imageAssets.length > 0) {
			brandAnalysis = await getCachedBrandAnalysis(productId, imageAssets);
		} else {
			brandAnalysis = {
				primaryColors: ['#1a1a2e', '#16213e'],
				secondaryColors: ['#0f3460', '#533483'],
				visualStyle: 'minimalist, professional',
				typography: 'clean sans-serif',
				mood: 'professional, trustworthy',
				patterns: 'clean lines, subtle gradients',
				imageStyleGuide:
					'Use clean professional imagery with minimal elements. Favor abstract geometric compositions with a modern tech aesthetic.'
			};
		}

		// Step 3+: Query posts and set total steps
		const planPosts = await db.query.posts.findMany({
			where: eq(posts.contentPlanId, contentPlanId)
		});

		const imagePostCount = planPosts.filter((p) => p.postType === 'static_image').length;
		const totalSteps = 2 + planPosts.length + imagePostCount; // brief + brand + N copies + M images
		await updateJob(jobId, { totalSteps });

		// Step 4: Generate copy for each post in batches of 3
		let currentStep = 2;
		for (let i = 0; i < planPosts.length; i += 3) {
			const batch = planPosts.slice(i, i + 3);

			const copyResults = await Promise.all(
				batch.map((post) =>
					generatePostCopy(
						{
							topic: post.topic,
							contentCategory: post.contentCategory,
							keyMessage: post.keyMessage
						},
						brief,
						post.platform
					)
				)
			);

			// Save each copy result
			for (let j = 0; j < batch.length; j++) {
				const copy = copyResults[j];
				await db
					.update(posts)
					.set({
						copyText: copy.fullText,
						hashtags: copy.hashtags,
						updatedAt: new Date()
					})
					.where(eq(posts.id, batch[j].id));
				currentStep++;
			}

			const doneCount = Math.min(i + 3, planPosts.length);
			await updateJob(jobId, {
				currentStep,
				progress: `Generating copy ${doneCount}/${planPosts.length}...`
			});

			// Rate limit delay between batches
			if (i + 3 < planPosts.length) {
				await delay(200);
			}
		}

		// Step 5: Generate images for static_image posts sequentially
		const imagePosts = planPosts.filter((p) => p.postType === 'static_image');
		for (let i = 0; i < imagePosts.length; i++) {
			const post = imagePosts[i];
			await updateJob(jobId, {
				currentStep,
				progress: `Generating image ${i + 1}/${imagePosts.length}...`
			});

			const result = await generatePostImage(
				post.topic,
				post.keyMessage,
				brandAnalysis,
				productId,
				post.id,
				post.platform
			);

			await db
				.update(posts)
				.set({
					imageUrl: result.imageUrl,
					imagePrompt: result.imagePrompt,
					updatedAt: new Date()
				})
				.where(eq(posts.id, post.id));

			currentStep++;

			// Rate limit delay between image calls
			if (i < imagePosts.length - 1) {
				await delay(500);
			}
		}

		// Step 6: Update all posts status to pending_review
		await db
			.update(posts)
			.set({ status: 'pending_review', updatedAt: new Date() })
			.where(eq(posts.contentPlanId, contentPlanId));

		// Step 7: Mark job completed
		await updateJob(jobId, {
			status: 'completed',
			currentStep: totalSteps,
			progress: 'All posts generated!'
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		console.error('Post generation failed:', err);
		await updateJob(jobId, {
			status: 'failed',
			error: message,
			progress: 'Post generation failed'
		});
	}
}
