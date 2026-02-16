import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required', email });
		}

		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters', email });
		}

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${url.origin}/callback?next=/dashboard/onboarding/quick-start`
			}
		});

		if (error) {
			return fail(400, { error: error.message, email });
		}

		throw redirect(303, '/verify-email');
	}
};
