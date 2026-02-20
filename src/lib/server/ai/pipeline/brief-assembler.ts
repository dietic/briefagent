import { db } from '$lib/server/db';
import { products, productBriefs, assets, contentPillars } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

export interface AssembledBrief {
	product: {
		id: string;
		name: string;
		description: string | null;
		websiteUrl: string | null;
		scrapedData: Record<string, unknown> | null;
	};
	brief: {
		problemSolved: string | null;
		keyFeatures: string[] | null;
		differentiator: string | null;
		pricingInfo: string | null;
		productStage: string | null;
		idealCustomer: string | null;
		industry: string | null;
		ageRange: string | null;
		painPoints: string[] | null;
		audienceHangouts: string[] | null;
		personalityTraits: string[] | null;
		exampleContent: string | null;
		wordsToUse: string[] | null;
		wordsToAvoid: string[] | null;
		mainGoal: string | null;
		postingFrequency: string | null;
	};
	assets: Array<{
		id: string;
		fileUrl: string;
		tag: string | null;
		description: string | null;
		isPrimary: boolean | null;
	}>;
	contentPillars: Array<{
		name: string;
		description: string | null;
		sortOrder: number;
	}>;
}

export async function assembleBrief(productId: string): Promise<AssembledBrief> {
	const product = await db.query.products.findFirst({
		where: eq(products.id, productId)
	});

	if (!product) {
		throw new Error('Product not found');
	}

	const brief = await db.query.productBriefs.findFirst({
		where: eq(productBriefs.productId, productId)
	});

	const productAssets = await db.query.assets.findMany({
		where: eq(assets.productId, productId)
	});

	const pillars = await db.query.contentPillars.findMany({
		where: eq(contentPillars.productId, productId),
		orderBy: [asc(contentPillars.sortOrder)]
	});

	return {
		product: {
			id: product.id,
			name: product.name,
			description: product.description,
			websiteUrl: product.websiteUrl,
			scrapedData: product.scrapedData as Record<string, unknown> | null
		},
		brief: brief
			? {
					problemSolved: brief.problemSolved,
					keyFeatures: brief.keyFeatures,
					differentiator: brief.differentiator,
					pricingInfo: brief.pricingInfo,
					productStage: brief.productStage,
					idealCustomer: brief.idealCustomer,
					industry: brief.industry,
					ageRange: brief.ageRange,
					painPoints: brief.painPoints,
					audienceHangouts: brief.audienceHangouts,
					personalityTraits: brief.personalityTraits,
					exampleContent: brief.exampleContent,
					wordsToUse: brief.wordsToUse,
					wordsToAvoid: brief.wordsToAvoid,
					mainGoal: brief.mainGoal,
					postingFrequency: brief.postingFrequency
				}
			: {
					problemSolved: null,
					keyFeatures: null,
					differentiator: null,
					pricingInfo: null,
					productStage: null,
					idealCustomer: null,
					industry: null,
					ageRange: null,
					painPoints: null,
					audienceHangouts: null,
					personalityTraits: null,
					exampleContent: null,
					wordsToUse: null,
					wordsToAvoid: null,
					mainGoal: null,
					postingFrequency: null
				},
		assets: productAssets.map((a) => ({
			id: a.id,
			fileUrl: a.fileUrl,
			tag: a.tag,
			description: a.description,
			isPrimary: a.isPrimary
		})),
		contentPillars: pillars.map((p) => ({
			name: p.name,
			description: p.description,
			sortOrder: p.sortOrder
		}))
	};
}
