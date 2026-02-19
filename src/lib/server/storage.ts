import { supabaseAdmin } from '$lib/server/supabase-admin';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateUpload(file: File): { valid: boolean; error?: string } {
	if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
		return { valid: false, error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, GIF, WebP` };
	}
	if (file.size > MAX_FILE_SIZE) {
		return { valid: false, error: 'File too large (max 10MB)' };
	}
	return { valid: true };
}

export async function uploadAssetToStorage(
	file: File,
	userId: string,
	productId: string
): Promise<string> {
	const filePath = `${userId}/${productId}/${crypto.randomUUID()}-${file.name}`;
	const { error: uploadError } = await supabaseAdmin.storage.from('assets').upload(filePath, file, {
		contentType: file.type,
		upsert: false
	});

	if (uploadError) {
		throw new Error(`Upload failed: ${uploadError.message}`);
	}

	const {
		data: { publicUrl }
	} = supabaseAdmin.storage.from('assets').getPublicUrl(filePath);

	return publicUrl;
}
