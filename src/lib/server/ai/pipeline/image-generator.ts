import { generateImage } from 'ai';
import { imageModel } from '../providers';
import sharp from 'sharp';
import type { BrandAnalysis } from '../schemas/brand-analysis';
import { buildImagePrompt } from '../prompts/image-system';
import { getPlatformSpec } from '../platform-specs';
import { supabaseAdmin } from '$lib/server/supabase-admin';

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
		size: '1024x1024',
		providerOptions: {
			openai: { quality: 'medium' }
		}
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

	return { imageUrl: publicUrl, imagePrompt: prompt };
}
