import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const supabase = locals.supabase;
		const data = await request.formData();
		const email = data.get('email') as string;
		const redirectTo = data.get('redirectTo') as string;

		if (!email) {
			return fail(400, { errors: {email: ['Email is required']} });
		}

		const emailRegex =
			/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!emailRegex.test(email)) {
			return fail(400, { errors: {email: ['Invalid email address']} });
		}

		const redirectUrl = `${url.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`;

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: redirectUrl,
				shouldCreateUser: true
			}
		});

		if (error) {
			return fail(500, { errors: { general: [error.message || "An unexpected error occurred"] } });
		}

		return { success: true };
	}
};
