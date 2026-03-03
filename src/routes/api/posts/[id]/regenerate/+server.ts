import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { assembleBrief } from '$lib/server/ai/pipeline/brief-assembler';
import {
	generatePostCopy,
	generateCarouselCopy,
	generateThreadCopy,
	generatePollCopy
} from '$lib/server/ai/pipeline/copy-generator';
import { generatePostImage, generateCarouselImages } from '$lib/server/ai/pipeline/image-generator';
import { getCachedBrandAnalysis } from '$lib/server/ai/pipeline/brand-analyzer';
import type { BrandAnalysis } from '$lib/server/ai/schemas/brand-analysis';

const regenerateSchema = z.object({
	type: z.enum(['copy', 'image', 'both', 'slide']),
	slideIndex: z.number().int().min(0).optional()
});

async function getBrandAnalysis(brief: ReturnType<typeof assembleBrief> extends Promise<infer T> ? T : never, productId: string): Promise<BrandAnalysis> {
	const imageAssets = brief.assets
		.filter((a) => a.tag !== 'testimonial')
		.map((a) => a.fileUrl);

	if (imageAssets.length > 0) {
		return getCachedBrandAnalysis(productId, imageAssets);
	}

	return {
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

export async function POST({ locals, params, request }: RequestEvent) {
	const user = await locals.getUser();
	if (!user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const parsed = regenerateSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: parsed.error.flatten() }, { status: 400 });
	}

	const post = await db.query.posts.findFirst({
		where: eq(posts.id, params.id!),
		with: { product: true }
	});

	if (!post || !post.product || post.product.userId !== user.id) {
		return json({ error: 'Post not found' }, { status: 404 });
	}

	const brief = await assembleBrief(post.productId!);
	const updates: Record<string, unknown> = {
		status: 'pending_review',
		updatedAt: new Date()
	};

	const { type, slideIndex } = parsed.data;
	const postSlot = {
		topic: post.topic,
		contentCategory: post.contentCategory,
		keyMessage: post.keyMessage
	};
	const contentData = (post.contentData ?? {}) as Record<string, unknown>;

	// ── Copy regeneration ───────────────────────────────────────────
	if (type === 'copy' || type === 'both') {
		if (post.postType === 'carousel') {
			const slideCount = (contentData.carouselSlideCount as number) ?? 6;
			const copy = await generateCarouselCopy(postSlot, slideCount, brief, post.platform);
			updates.copyText = copy.introText;
			updates.hashtags = copy.hashtags;
			updates.contentData = {
				...contentData,
				slides: copy.slides.map((s) => ({
					headline: s.headline,
					body: s.body,
					// Preserve existing image URLs
					imageUrl: (contentData.slides as Array<{ imageUrl?: string }> | undefined)?.[copy.slides.indexOf(s)]?.imageUrl,
					imagePrompt: (contentData.slides as Array<{ imagePrompt?: string }> | undefined)?.[copy.slides.indexOf(s)]?.imagePrompt
				}))
			};
		} else if (post.postType === 'thread') {
			const tweetCount = (contentData.threadTweetCount as number) ?? 5;
			const copy = await generateThreadCopy(postSlot, tweetCount, brief, post.platform);
			updates.copyText = copy.tweets[0]?.text ?? '';
			updates.hashtags = copy.hashtags;
			updates.contentData = { ...contentData, tweets: copy.tweets };
		} else if (post.postType === 'poll') {
			const pollOptions = contentData.pollOptions as string[] | undefined;
			const copy = await generatePollCopy(postSlot, pollOptions, brief, post.platform);
			updates.copyText = copy.contextPost;
			updates.hashtags = copy.hashtags;
			updates.contentData = {
				...contentData,
				question: copy.question,
				options: copy.options
			};
		} else {
			const copy = await generatePostCopy(postSlot, brief, post.platform);
			updates.copyText = copy.fullText;
			updates.hashtags = copy.hashtags;
		}
	}

	// Use freshly generated copy data if available, otherwise fall back to DB snapshot
	const workingContentData = (updates.contentData as Record<string, unknown>) ?? contentData;

	// ── Image regeneration ──────────────────────────────────────────
	if (type === 'image' || type === 'both') {
		const brandAnalysis = await getBrandAnalysis(brief, post.productId!);

		if (post.postType === 'carousel') {
			const slides = (workingContentData.slides ?? []) as Array<{ headline: string; body: string; imageUrl?: string; imagePrompt?: string }>;
			const slideResults = await generateCarouselImages(slides, brandAnalysis, post.productId!, post.id);
			const updatedSlides = slides.map((s, idx) => ({
				...s,
				imageUrl: slideResults[idx]?.imageUrl,
				imagePrompt: slideResults[idx]?.imagePrompt
			}));
			updates.imageUrl = slideResults[0]?.imageUrl ?? null;
			updates.contentData = { ...workingContentData, slides: updatedSlides };
		} else if (post.postType === 'static_image') {
			const result = await generatePostImage(
				post.topic,
				post.keyMessage,
				brandAnalysis,
				post.productId!,
				post.id,
				post.platform
			);
			updates.imageUrl = result.imageUrl;
			updates.imagePrompt = result.imagePrompt;
		}
		// thread and poll: no images to regenerate
	}

	// ── Single slide regeneration (carousel only) ───────────────────
	if (type === 'slide' && post.postType === 'carousel' && slideIndex !== undefined) {
		const brandAnalysis = await getBrandAnalysis(brief, post.productId!);
		const slides = (contentData.slides ?? []) as Array<{ headline: string; body: string; imageUrl?: string; imagePrompt?: string }>;

		if (slideIndex >= 0 && slideIndex < slides.length) {
			const { buildCarouselSlideImagePrompt, buildSlideTextSvg } = await import('$lib/server/ai/prompts/image-system');
			const { generateImage } = await import('ai');
			const { imageModel } = await import('$lib/server/ai/providers');
			const sharp = (await import('sharp')).default;
			const { supabaseAdmin } = await import('$lib/server/supabase-admin');

			const slide = slides[slideIndex];
			const prompt = buildCarouselSlideImagePrompt(
				slideIndex + 1,
				slides.length,
				slide.headline,
				slide.body,
				brandAnalysis
			);

			const { image } = await generateImage({
				model: imageModel,
				prompt,
				aspectRatio: '1:1'
			});

			const buffer = Buffer.from(image.uint8Array);
			const textOverlay = buildSlideTextSvg(slide.headline, slide.body, 1200, 1200);
			const final = await sharp(buffer)
				.resize(1200, 1200, { fit: 'cover' })
				.composite([{ input: textOverlay, top: 0, left: 0 }])
				.jpeg({ quality: 90 })
				.toBuffer();
			const filePath = `${post.productId}/${post.id}/slide-${slideIndex}.jpg`;

			const { error: uploadError } = await supabaseAdmin.storage
				.from('generated-images')
				.upload(filePath, final, { contentType: 'image/jpeg', upsert: true });

			if (uploadError) throw new Error(`Slide upload failed: ${uploadError.message}`);

			const { data: { publicUrl } } = supabaseAdmin.storage.from('generated-images').getPublicUrl(filePath);
			const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

			const updatedSlides = [...slides];
			updatedSlides[slideIndex] = { ...slide, imageUrl: cacheBustedUrl, imagePrompt: prompt };
			updates.contentData = { ...contentData, slides: updatedSlides };
			if (slideIndex === 0) updates.imageUrl = cacheBustedUrl;
		}
	}

	await db.update(posts).set(updates).where(eq(posts.id, params.id!));

	return json({ success: true });
}
