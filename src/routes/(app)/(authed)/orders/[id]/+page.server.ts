import ordersRepository from '$lib/repositories/orders.repository';
import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import internalSettingsRepository from '$lib/repositories/internal_settings.repository';
import { PRIVATE_PAYSTACK_SECRET_KEY } from '$env/static/private';
import { convertAmount } from '../../../../../lib/utils/helpers';

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

const generateReference = () => {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomString}`.toUpperCase();
};

export const actions: Actions = {


	pay: async ({ params, locals }) => {
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

			const amountInNaira = convertAmount(order!.total, exchangeRate);
      const reference = generateReference();

			const response = await fetch('https://api.paystack.co/transaction/initialize', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${PRIVATE_PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: locals.user.email,
					amount: amountInNaira * 100, 
					currency: 'NGN',
					reference,
				})
			});

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error initializing Paystack transaction:', errorData);
        throw error(response.status, errorData.message || 'Failed to initialize transaction');
      }

			const data = await response.json();

      // Create a payment reference record in the database
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
      
      return { paystackData: data, success: true };
		} catch (err) {
			console.error('Error processing payment:', err);
			throw error(500, 'Internal Server Error');
		}
	},
};
