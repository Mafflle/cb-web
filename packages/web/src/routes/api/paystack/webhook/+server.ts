import { dev } from '$app/environment';
import { PRIVATE_PAYSTACK_SECRET_KEY, PRIVATE_SUPABASE_SECRET_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import { json, type RequestHandler } from '@sveltejs/kit';
import crypto from 'crypto';
import { type Database } from '@chowbenin/shared/types';
import ordersRepository from '$lib/repositories/orders.repository';

const PAYSTACK_IPS = ['52.31.139.75', '52.49.173.169', '52.214.14.220'];

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	try {
		const clientIp = getClientAddress();
		if (!dev && !PAYSTACK_IPS.includes(clientIp)) {
			console.warn(`Webhook request from unauthorized IP: ${clientIp}`);
			return new Response('Forbidden', { status: 403 });
		}

		const rawBody = await request.text();
		
		if (!rawBody) {
			return new Response('Empty request body', { status: 400 });
		}

		const signature = request.headers.get('x-paystack-signature');
		if (!signature) {
			console.warn('Missing x-paystack-signature header');
			return new Response('Missing signature', { status: 400 });
		}

		const expectedSignature = crypto
			.createHmac('sha512', PRIVATE_PAYSTACK_SECRET_KEY)
			.update(rawBody)
			.digest('hex');

		if (signature !== expectedSignature) {
			console.warn('Invalid webhook signature');
			return new Response('Invalid signature', { status: 400 });
		}

		const payload = JSON.parse(rawBody);

		switch (payload.event) {
			case 'charge.success':
				await handleChargeSuccess(payload.data);
				break;
			
			case 'charge.failed':
				await handleChargeFailed(payload.data);
				break;

			default:
				console.log(`Unhandled webhook event: ${payload.event}`);
		}

		return json({ received: true });

	} catch (error) {
		console.error('Webhook processing error:', error);
		return json({ received: true, error: 'Processing error logged' });
	}
};

/**
 * Handle successful charge events
 */
async function handleChargeSuccess(data: any) {
	const transactionRef = data.reference;

	if (!transactionRef) {
		console.error('Missing transaction reference in webhook data');
		return;
	}

	const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SECRET_KEY, {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});

	const payment = await ordersRepository.getPaymentByTransactionRef(supabase, transactionRef);

	if (!payment) {
		console.error('Payment record not found for ref:', transactionRef);
		return;
	}

	if (payment.payment_status === 'paid') {
		console.log('Payment already processed:', transactionRef);
		return;
	}

	const expectedAmountInKobo = payment.amount * 100;
	if (data.amount !== expectedAmountInKobo) {
		console.error('Amount mismatch:', {
			expected: expectedAmountInKobo,
			received: data.amount,
			reference: transactionRef
		});
		return;
	}

	await ordersRepository.updatePaymentStatus(
		supabase,
		payment.order_id as string,
		transactionRef,
		'paid'
	);

	console.log('Payment verified and updated:', transactionRef);
}

/**
 * Handle failed charge events
 */
async function handleChargeFailed(data: any) {
	const transactionRef = data.reference;

	if (!transactionRef) {
		console.error('Missing transaction reference in failed charge');
		return;
	}

	const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SECRET_KEY, {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});

	await ordersRepository.updatePaymentStatus(
		supabase,
		data.metadata?.order_id || '',
		transactionRef,
		'failed'
	);

	console.log('Payment marked as failed:', transactionRef);
}