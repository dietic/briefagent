import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email) {
			return fail(400, { error: 'Email is required', email });
		}

		// Always call resetPasswordForEmail - don't reveal if email exists
		await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${url.origin}/callback?next=/reset-password`
		});

		// Always return success regardless of whether email exists
		return { success: true };
	}
};
