import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { assets, products } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { validateUpload, uploadAssetToStorage } from '$lib/server/storage';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = await locals.getUser();
	if (!user) throw error(401, 'Not authenticated');

	const formData = await request.formData();
	const file = formData.get('file') as File;
	const productId = formData.get('product_id') as string;
	const tag = (formData.get('tag') as string) || null;
	const description = (formData.get('description') as string) || null;

	if (!file || !productId) throw error(400, 'Missing file or product_id');

	const validation = validateUpload(file);
	if (!validation.valid) throw error(400, validation.error!);

	const publicUrl = await uploadAssetToStorage(file, user.id, productId);

	const [asset] = await db
		.insert(assets)
		.values({
			productId,
			fileUrl: publicUrl,
			fileName: file.name,
			fileType: file.type,
			fileSize: file.size,
			tag,
			description
		})
		.returning();

	if (tag === 'logo') {
		await db.update(products).set({ logoUrl: publicUrl }).where(eq(products.id, productId));
	}

	return json(asset);
};
