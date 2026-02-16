import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function requireAuth(event: RequestEvent) {
	const user = await event.locals.getUser();
	if (!user) throw redirect(303, '/login');
	return user;
}
