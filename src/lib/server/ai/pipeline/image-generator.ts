import { generateImage } from 'ai';
import { imageModel } from '../providers';
import sharp from 'sharp';
import type { BrandAnalysis } from '../schemas/brand-analysis';
import { buildImagePrompt, buildCarouselSlideImagePrompt, buildSlideTextSvg } from '../prompts/image-system';
import { getPlatformSpec } from '../platform-specs';
import { supabaseAdmin } from '$lib/server/supabase-admin';

function cacheBust(url: string): string {
	return `${url}?t=${Date.now()}`;
}

export async function generatePostImage(
	postTopic: string,
	keyMessage: string,
	brandAnalysis: BrandAnalysis,
	productId: string,
	postId: string,
	platform: string | null = null
): Promise<{ imageUrl: string; imagePrompt: string }> {
	const spec = getPlatformSpec(platform);
	const prompt = buildImagePrompt(postTopic, keyMessage, brandAnalysis, platform);

	const { image } = await generateImage({
		model: imageModel,
		prompt,
		aspectRatio: spec.imageAspectRatio
	});

	const buffer = Buffer.from(image.uint8Array);

	const resized = await sharp(buffer)
		.resize(spec.imageSize.width, spec.imageSize.height, { fit: 'cover' })
		.jpeg({ quality: 90 })
		.toBuffer();

	const filePath = `${productId}/${postId}.jpg`;

	const { error: uploadError } = await supabaseAdmin.storage
		.from('generated-images')
		.upload(filePath, resized, {
			contentType: 'image/jpeg',
			upsert: true
		});

	if (uploadError) {
		throw new Error(`Image upload failed: ${uploadError.message}`);
	}

	const {
		data: { publicUrl }
	} = supabaseAdmin.storage.from('generated-images').getPublicUrl(filePath);

	return { imageUrl: cacheBust(publicUrl), imagePrompt: prompt };
}

export async function generateCarouselImages(
	slides: Array<{ headline: string; body: string }>,
	brandAnalysis: BrandAnalysis,
	productId: string,
	postId: string
): Promise<Array<{ imageUrl: string; imagePrompt: string }>> {
	const results: Array<{ imageUrl: string; imagePrompt: string }> = [];

	for (let i = 0; i < slides.length; i++) {
		const slide = slides[i];
		const prompt = buildCarouselSlideImagePrompt(
			i + 1,
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

		// Resize background, then composite headline + body text via SVG overlay
		const textOverlay = buildSlideTextSvg(slide.headline, slide.body, 1200, 1200);
		const final = await sharp(buffer)
			.resize(1200, 1200, { fit: 'cover' })
			.composite([{ input: textOverlay, top: 0, left: 0 }])
			.jpeg({ quality: 90 })
			.toBuffer();

		const filePath = `${productId}/${postId}/slide-${i}.jpg`;

		const { error: uploadError } = await supabaseAdmin.storage
			.from('generated-images')
			.upload(filePath, final, {
				contentType: 'image/jpeg',
				upsert: true
			});

		if (uploadError) {
			throw new Error(`Carousel slide ${i} upload failed: ${uploadError.message}`);
		}

		const {
			data: { publicUrl }
		} = supabaseAdmin.storage.from('generated-images').getPublicUrl(filePath);

		results.push({ imageUrl: cacheBust(publicUrl), imagePrompt: prompt });
	}

	return results;
}
