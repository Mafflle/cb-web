import ordersRepository from '$lib/repositories/orders.repository';
import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import internalSettingsRepository from '$lib/repositories/internal_settings.repository';
import { convertAmount } from '$lib/utils/helpers';
import { paymentMethods } from '$lib/utils/constants';
import { paystackService } from '$lib/services/paystack.service';
import momoService from '$lib/services/momo.service';
import { PUBLIC_MOMO_CALLBACK_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const order = await ordersRepository.getById(locals.supabase, params.id);

		if (!order || order.user_id !== locals.user?.id) {
			throw error(404, 'Order Not Found');
		}

		return { order };
	} catch (err) {
		console.error('Error loading order:', err);
		throw error(500, 'Internal Server Error');
	}
};


export const actions: Actions = {


	pay: async ({ params, locals, request }) => {
		const formData = await request.formData();
		const paymentMethod = formData.get('payment_method')?.toString().trim();

		if (!paymentMethod || typeof paymentMethod !== 'string') {
			throw error(400, { message: 'Payment method is required' });
		}

		if (Object.values(paymentMethods).indexOf(paymentMethod) === -1) {
			throw error(400, { message: 'Invalid payment method' });
		}

		if (!locals.user) {
			throw error(401, { message: 'Unauthorized' });
		}

		const orderId = params.id;

		if (!orderId) {
			throw error(400, { message: 'Order ID is required' });
		}

		try {
			const order = await ordersRepository.getById(locals.supabase, orderId);

			const { exchange_rate: exchangeRate } = await internalSettingsRepository.getInternalSettings(
				locals.supabase
			);

			if (paymentMethod === paymentMethods.PAYSTACK) {
				const amountInNaira = convertAmount(order!.total, exchangeRate);

				const { data, reference } = await paystackService.initiatePayment(
					amountInNaira,
					locals.user.email as string
				);
				
				const { error: paymentRefError } = await locals.supabase.from('payments').insert({
					order_id: orderId,
					amount: amountInNaira,
					currency: 'NGN',
					payment_method: 'paystack',
					payment_status: 'pending',
					transaction_reference: reference
				});
	
				if (paymentRefError) {
					console.error('Error creating payment reference:', paymentRefError);
					throw error(500, 'Failed to create payment reference');
				}
				
				return { data, success: true };
			} else if (paymentMethod === paymentMethods.MOMO) {
				const momoPhoneNumber = formData.get('momo_phone')?.toString().trim().replace(/\s+/g, '');
				if (!momoPhoneNumber) {
					throw error(400, 'Mobile Money phone number is required for MoMo payments');
				}
				
				const { reference } = await momoService.requestToPay(
					{
						amount: order!.total,
						currency: 'XOF',
						callbackUrl: PUBLIC_MOMO_CALLBACK_URL,
						payerPhoneNumber: momoPhoneNumber
					}
				);
				
				const { error: paymentRefError } = await locals.supabase.from('payments').insert({
					order_id: orderId,
					amount: order!.total,
					currency: 'XOF',
					payment_method: 'momo',
					payment_status: 'pending',
					transaction_reference: reference
				});
	
				if (paymentRefError) {
					console.error('Error creating MoMo payment reference:', paymentRefError);
					throw error(500, 'Failed to create MoMo payment reference');
				}

				try {
					await momoService.requestToPayDeliveryNotification(reference);
				} catch (err) {
					console.error('Error sending MoMo delivery notification:', err);
				}

				return { reference, success: true };
			}
			
			throw error(400, 'Unsupported payment method');
		} catch (err) {
			console.error('Error processing payment:', err);
			throw error(500, 'Internal Server Error');
		}
	},
};
