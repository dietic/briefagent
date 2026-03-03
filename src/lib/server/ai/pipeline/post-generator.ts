import { generatePostCopy, generateCarouselCopy, generateThreadCopy, generatePollCopy } from './copy-generator';
import { generatePostImage, generateCarouselImages } from './image-generator';
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

/** Count the number of image generation steps a post will require */
function imageStepsForPost(post: { postType: string; contentData: unknown }): number {
	if (post.postType === 'static_image') return 1;
	if (post.postType === 'carousel') {
		const data = post.contentData as { carouselSlideCount?: number } | null;
		return data?.carouselSlideCount ?? 6;
	}
	// thread, poll, text_only — no images
	return 0;
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

		const totalImageSteps = planPosts.reduce((sum, p) => sum + imageStepsForPost(p), 0);
		const totalSteps = 2 + planPosts.length + totalImageSteps; // brief + brand + N copies + M images
		await updateJob(jobId, { totalSteps });

		// Step 4: Generate copy for each post (batches of 3 for standard, sequential for special types)
		let currentStep = 2;
		for (let i = 0; i < planPosts.length; i++) {
			const post = planPosts[i];
			const postSlot = {
				topic: post.topic,
				contentCategory: post.contentCategory,
				keyMessage: post.keyMessage
			};
			const contentData = post.contentData as Record<string, unknown> | null;

			if (post.postType === 'carousel') {
				const slideCount = (contentData?.carouselSlideCount as number) ?? 6;
				const copy = await generateCarouselCopy(postSlot, slideCount, brief, post.platform);
				await db
					.update(posts)
					.set({
						copyText: copy.introText,
						hashtags: copy.hashtags,
						contentData: {
							...contentData,
							slides: copy.slides.map((s) => ({ headline: s.headline, body: s.body }))
						},
						updatedAt: new Date()
					})
					.where(eq(posts.id, post.id));
			} else if (post.postType === 'thread') {
				const tweetCount = (contentData?.threadTweetCount as number) ?? 5;
				const copy = await generateThreadCopy(postSlot, tweetCount, brief, post.platform);
				await db
					.update(posts)
					.set({
						copyText: copy.tweets[0]?.text ?? '',
						hashtags: copy.hashtags,
						contentData: {
							...contentData,
							tweets: copy.tweets
						},
						updatedAt: new Date()
					})
					.where(eq(posts.id, post.id));
			} else if (post.postType === 'poll') {
				const pollOptions = contentData?.pollOptions as string[] | undefined;
				const copy = await generatePollCopy(postSlot, pollOptions, brief, post.platform);
				await db
					.update(posts)
					.set({
						copyText: copy.contextPost,
						hashtags: copy.hashtags,
						contentData: {
							...contentData,
							question: copy.question,
							options: copy.options,
							durationDays: 3
						},
						updatedAt: new Date()
					})
					.where(eq(posts.id, post.id));
			} else {
				// static_image or text_only — use existing generator
				const copy = await generatePostCopy(postSlot, brief, post.platform);
				await db
					.update(posts)
					.set({
						copyText: copy.fullText,
						hashtags: copy.hashtags,
						updatedAt: new Date()
					})
					.where(eq(posts.id, post.id));
			}

			currentStep++;
			const doneCount = i + 1;
			await updateJob(jobId, {
				currentStep,
				progress: `Generating copy ${doneCount}/${planPosts.length}...`
			});

			// Rate limit delay
			if (i < planPosts.length - 1) {
				await delay(200);
			}
		}

		// Step 5: Generate images — static_image posts get one image, carousel posts get per-slide images
		const postsNeedingImages = planPosts.filter(
			(p) => p.postType === 'static_image' || p.postType === 'carousel'
		);
		let imageIdx = 0;
		const totalImages = postsNeedingImages.reduce((sum, p) => sum + imageStepsForPost(p), 0);

		for (const post of postsNeedingImages) {
			if (post.postType === 'static_image') {
				await updateJob(jobId, {
					currentStep,
					progress: `Generating image ${imageIdx + 1}/${totalImages}...`
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
				imageIdx++;
				await delay(500);
			} else if (post.postType === 'carousel') {
				// Re-read the post to get the updated contentData with slides
				const freshPost = await db.query.posts.findFirst({
					where: eq(posts.id, post.id)
				});
				const data = (freshPost?.contentData ?? {}) as Record<string, unknown>;
				const slides = (data.slides ?? []) as Array<{ headline: string; body: string }>;

				await updateJob(jobId, {
					currentStep,
					progress: `Generating carousel images ${imageIdx + 1}/${totalImages}...`
				});

				const slideResults = await generateCarouselImages(
					slides,
					brandAnalysis,
					productId,
					post.id
				);

				// Merge imageUrl into each slide in contentData
				const updatedSlides = slides.map((s, idx) => ({
					...s,
					imageUrl: slideResults[idx]?.imageUrl,
					imagePrompt: slideResults[idx]?.imagePrompt
				}));

				await db
					.update(posts)
					.set({
						imageUrl: slideResults[0]?.imageUrl ?? null,
						contentData: { ...data, slides: updatedSlides },
						updatedAt: new Date()
					})
					.where(eq(posts.id, post.id));

				currentStep += slides.length;
				imageIdx += slides.length;
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
