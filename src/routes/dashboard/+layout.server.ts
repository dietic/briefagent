import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = await locals.getUser();
	if (!user) throw redirect(303, '/login');
	return { user };
};
