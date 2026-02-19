import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { assembleBrief } from '$lib/server/ai/pipeline/brief-assembler';
import { generatePostCopy } from '$lib/server/ai/pipeline/copy-generator';
import { generatePostImage } from '$lib/server/ai/pipeline/image-generator';
import { getCachedBrandAnalysis } from '$lib/server/ai/pipeline/brand-analyzer';

const regenerateSchema = z.object({
	type: z.enum(['copy', 'image', 'both'])
});

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

	const { type } = parsed.data;

	if (type === 'copy' || type === 'both') {
		const copy = await generatePostCopy(
			{
				topic: post.topic,
				contentCategory: post.contentCategory,
				keyMessage: post.keyMessage
			},
			brief
		);
		updates.copyText = copy.fullText;
		updates.hashtags = copy.hashtags;
	}

	if (type === 'image' || type === 'both') {
		const imageAssets = brief.assets
			.filter((a) => a.tag !== 'testimonial')
			.map((a) => a.fileUrl);

		let brandAnalysis;
		if (imageAssets.length > 0) {
			brandAnalysis = await getCachedBrandAnalysis(post.productId!, imageAssets);
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

		const result = await generatePostImage(
			post.topic,
			post.keyMessage,
			brandAnalysis,
			post.productId!,
			post.id
		);
		updates.imageUrl = result.imageUrl;
		updates.imagePrompt = result.imagePrompt;
	}

	await db.update(posts).set(updates).where(eq(posts.id, params.id!));

	return json({ success: true });
}
