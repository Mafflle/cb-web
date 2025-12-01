import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = locals;

	if (!session) {
		throw error(401, 'Unauthorized');
	}

	const user = session.user;

	return {
		user: {
			id: user.id,
			email: user.email,
			phone: user.phone,
			fullName: user.user_metadata?.full_name || '',
			avatarUrl: user.user_metadata?.avatar_url || null,
			createdAt: user.created_at
		}
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const { supabase, session } = locals;

		if (!session) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const fullName = formData.get('fullName') as string;

		if (!fullName || fullName.trim().length < 2) {
			return fail(400, {
				error: 'Full name must be at least 2 characters',
				field: 'fullName'
			});
		}

		const { error: updateError } = await supabase.auth.updateUser({
			data: {
				full_name: fullName.trim()
			}
		});

		if (updateError) {
			return fail(500, {
				error: 'Failed to update profile. Please try again.',
				field: 'general'
			});
		}

		return { success: true, message: 'Profile updated successfully' };
	},

	updateEmail: async ({ request, locals }) => {
		const { supabase, session } = locals;

		if (!session) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email || !email.includes('@')) {
			return fail(400, {
				error: 'Please enter a valid email address',
				field: 'email'
			});
		}

		if (email === session.user.email) {
			return fail(400, {
				error: 'This is already your current email',
				field: 'email'
			});
		}

		const { error: updateError } = await supabase.auth.updateUser({
			email: email.trim()
		});

		if (updateError) {
			return fail(500, {
				error: 'Failed to update email. Please try again.',
				field: 'email'
			});
		}

		return {
			success: true,
			message: 'Verification email sent. Please check your inbox to confirm the change.'
		};
	}
};
