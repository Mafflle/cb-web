import { dev } from '$app/environment';
import { PRIVATE_PAYSTACK_SECRET_KEY, PRIVATE_SUPABASE_SECRET_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import { json, type RequestHandler } from '@sveltejs/kit';
import crypto from 'crypto';
import { type Database } from '$lib/types/database.types';

// Paystack's IP addresses for webhook requests
// See: https://paystack.com/docs/payments/webhooks/#ip-whitelisting
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

	const { data: payment, error: fetchError } = await supabase
		.from('payments')
		.select('*')
		.eq('transaction_reference', transactionRef)
		.single();

	if (fetchError || !payment) {
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

	const { error: updateError } = await supabase.rpc('update_payment_status', {
		p_order_id: payment.order_id as string,
		p_transaction_ref: transactionRef,
		p_status: 'paid'
	});

	if (updateError) {
		console.error('Failed to update payment status:', updateError);
		return;
	}

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

	const { error } = await supabase.rpc('update_payment_status', {
		p_order_id: data.metadata?.order_id || '',
		p_transaction_ref: transactionRef,
		p_status: 'failed'
	});

	if (error) {
		console.error('Failed to update payment status to failed:', error);
		return;
	}

	console.log('Payment marked as failed:', transactionRef);
}