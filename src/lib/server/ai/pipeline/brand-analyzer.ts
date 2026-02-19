import { generateText, Output } from 'ai';
import { analysisModel } from '../providers';
import { brandAnalysisSchema, type BrandAnalysis } from '../schemas/brand-analysis';
import { buildBrandAnalysisPrompt } from '../prompts/brand-analysis';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function analyzeBrandAssets(assetUrls: string[]): Promise<BrandAnalysis> {
	const urls = assetUrls.slice(0, 5);

	const imageContent = urls.map((url) => ({
		type: 'image' as const,
		image: url
	}));

	const { experimental_output: output } = await generateText({
		model: analysisModel,
		experimental_output: Output.object({ schema: brandAnalysisSchema }),
		messages: [
			{
				role: 'system',
				content: buildBrandAnalysisPrompt()
			},
			{
				role: 'user',
				content: [
					{ type: 'text', text: 'Analyze these brand assets and extract the visual identity:' },
					...imageContent
				]
			}
		]
	});

	if (!output) {
		throw new Error('Brand analysis returned no output');
	}

	return output;
}

export async function getCachedBrandAnalysis(
	productId: string,
	assetUrls: string[]
): Promise<BrandAnalysis> {
	const product = await db.query.products.findFirst({
		where: eq(products.id, productId)
	});

	if (product?.brandAnalysis) {
		return product.brandAnalysis as unknown as BrandAnalysis;
	}

	const result = await analyzeBrandAssets(assetUrls);

	await db
		.update(products)
		.set({ brandAnalysis: result })
		.where(eq(products.id, productId));

	return result;
}
