import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateSchema = z
	.object({
		status: z
			.enum(['draft', 'pending_review', 'approved', 'rejected', 'scheduled', 'published'])
			.optional(),
		copyText: z.string().optional(),
		hashtags: z.array(z.string()).optional(),
		scheduledAt: z.string().optional(),
		rejectionReason: z.string().optional(),
		contentData: z.record(z.string(), z.unknown()).optional()
	})
	.refine(
		(data) => {
			if (data.status === 'rejected' && !data.rejectionReason) return false;
			return true;
		},
		{ message: 'rejectionReason is required when status is rejected' }
	);

export async function PATCH({ locals, params, request }: RequestEvent) {
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

	const parsed = updateSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: parsed.error.flatten() }, { status: 400 });
	}

	const post = await db.query.posts.findFirst({
		where: eq(posts.id, params.id!),
		with: {
			product: {
				columns: { userId: true }
			}
		}
	});

	if (!post || !post.product || post.product.userId !== user.id) {
		return json({ error: 'Post not found' }, { status: 404 });
	}

	const data = parsed.data;
	const updates: Record<string, unknown> = {
		updatedAt: new Date()
	};

	if (data.status !== undefined) updates.status = data.status;
	if (data.copyText !== undefined) updates.copyText = data.copyText;
	if (data.hashtags !== undefined) updates.hashtags = data.hashtags;
	if (data.rejectionReason !== undefined) updates.rejectionReason = data.rejectionReason;
	if (data.scheduledAt !== undefined) updates.scheduledAt = new Date(data.scheduledAt);
	if (data.contentData !== undefined) updates.contentData = data.contentData;
	if (data.status === 'published') updates.publishedAt = new Date();

	await db.update(posts).set(updates).where(eq(posts.id, params.id!));

	return json({ success: true });
}
