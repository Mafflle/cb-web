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

		console.log(`Sending magic link to ${email} with redirect to ${redirectTo}`);

		const redirectUrl = new URL('/auth/callback', url.origin);
		console.log(`Full redirect URL for magic link: ${redirectUrl.toString()}`);

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: false,
				emailRedirectTo: redirectUrl.toString()
			}
		});

		if (error) {
			return fail(500, { errors: { general: [error.message || "An unexpected error occurred"] } });
		}

		return { success: true };
	}
};
