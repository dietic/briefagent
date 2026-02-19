import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products, productBriefs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const product = await db.query.products.findFirst({
		where: eq(products.userId, user.id)
	});

	if (!product) {
		throw redirect(303, '/dashboard/onboarding/quick-start');
	}

	const brief = await db.query.productBriefs.findFirst({
		where: eq(productBriefs.productId, product.id)
	});

	return { product, brief: brief ?? null };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user) throw redirect(303, '/login');

		const formData = await request.formData();

		const product = await db.query.products.findFirst({
			where: eq(products.userId, user.id)
		});

		if (!product) {
			return fail(400, { error: 'No product found. Please complete Quick Start first.' });
		}

		// Parse form fields
		const problemSolved = (formData.get('problemSolved') as string) || null;
		const differentiator = (formData.get('differentiator') as string) || null;
		const pricingInfo = (formData.get('pricingInfo') as string) || null;
		const productStage = (formData.get('productStage') as string) || null;
		const idealCustomer = (formData.get('idealCustomer') as string) || null;
		const industry = (formData.get('industry') as string) || null;
		const ageRange = (formData.get('ageRange') as string) || null;
		const exampleContent = (formData.get('exampleContent') as string) || null;
		const mainGoal = (formData.get('mainGoal') as string) || null;
		const postingFrequency = (formData.get('postingFrequency') as string) || null;

		// Parse array fields from JSON hidden inputs
		const parseArray = (key: string): string[] | null => {
			const raw = formData.get(key) as string;
			if (!raw) return null;
			try {
				const parsed = JSON.parse(raw);
				return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
			} catch {
				return raw
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean) || null;
			}
		};

		const keyFeatures = parseArray('keyFeatures');
		const painPoints = parseArray('painPoints');
		const audienceHangouts = parseArray('audienceHangouts');
		const personalityTraits = parseArray('personalityTraits');
		const wordsToUse = parseArray('wordsToUse');
		const wordsToAvoid = parseArray('wordsToAvoid');

		const briefData = {
			productId: product.id,
			problemSolved,
			keyFeatures,
			differentiator,
			pricingInfo,
			productStage,
			idealCustomer,
			industry,
			ageRange,
			painPoints,
			audienceHangouts,
			personalityTraits,
			exampleContent,
			wordsToUse,
			wordsToAvoid,
			mainGoal,
			postingFrequency,
			updatedAt: new Date()
		};

		// Upsert: insert or update on conflict
		await db
			.insert(productBriefs)
			.values(briefData)
			.onConflictDoUpdate({
				target: productBriefs.productId,
				set: briefData
			});

		// Update onboarding step
		await db
			.update(products)
			.set({ onboardingStep: 'assets', updatedAt: new Date() })
			.where(eq(products.id, product.id));

		throw redirect(303, '/dashboard/onboarding/assets');
	}
};
