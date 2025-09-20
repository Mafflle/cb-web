import { fail, type Actions } from '@sveltejs/kit';
import { supportedCountries } from '$lib/utils/constants';

export const actions: Actions = {
	sendOtp: async ({ request, locals }) => {
		const formData = await request.formData();
		const countryCode = formData.get('country_code') as string;
		const phoneNumber = formData.get('phone_number') as string;

		const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
		const fullPhoneNumber = `${countryCode}${cleanedPhoneNumber}`;

		if (!phoneNumber || phoneNumber.length === 0) {
			return fail(400, {
				error: 'Please enter your phone number.'
			});
		} else if (phoneNumber.length < supportedCountries[countryCode].maxlength) {
			return fail(400, {
				error: `Phone number must be ${supportedCountries[countryCode].maxlength} digits.`
			});
		}

		const { error } = await locals.supabase.auth.signInWithOtp({
			phone: fullPhoneNumber,
			options: {
				channel: 'whatsapp'
			}
		});

		if (error) {
			console.error('Error sending OTP:', error);
			return fail(400, {
				error: 'Error sending OTP. Please try again later or contact support.'
			});
		}

		return { success: true };
	},

	verifyOtp: async ({ request, locals }) => {
		const formData = await request.formData();
		const phoneNumber = formData.get('phone_number') as string;
		const otp = formData.get('otp') as string;

		if (!phoneNumber) {
			return fail(400, { error: 'Error verifying OTP. Please try again.' });
		}

		if (!otp || otp.trim().length === 0) {
			return fail(400, { error: 'Please enter the OTP sent to your phone.' });
		}

		const { error } = await locals.supabase.auth.verifyOtp({
			phone: phoneNumber,
			token: otp.trim(),
			type: 'sms'
		});

		if (error) {
			if (error.code === 'otp_expired') {
				return fail(400, { error: 'Invalid OTP. Please try again.' });
			}

			console.error('Error verifying OTP:', error);
			return fail(400, {
				error: 'Error verifying OTP. Please try again later or contact support.'
			});
		}

		return { success: true };
	}
};
