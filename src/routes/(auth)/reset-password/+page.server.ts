import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await locals.getUser();
	if (!user) throw redirect(303, '/login');
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirm_password') as string;

		if (!password || !confirmPassword) {
			return fail(400, { error: 'Both password fields are required' });
		}

		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match' });
		}

		const { error } = await supabase.auth.updateUser({ password });

		if (error) {
			return fail(400, { error: error.message });
		}

		throw redirect(303, '/dashboard');
	}
};
