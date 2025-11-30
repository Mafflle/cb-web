import { json, type RequestHandler } from "@sveltejs/kit";
import ordersRepository from "$lib/repositories/orders.repository";
import { PRIVATE_PAYSTACK_SECRET_KEY } from "$env/static/private";
import { convertAmount } from "$lib/utils/helpers";
import { internalSettingsRepository } from '$lib/repositories/internal_settings.repository';


export const POST: RequestHandler = async ({ params, locals, request, fetch }) => {
  const { orderId } = params;
  const session = await locals.safeGetSession();
  const { supabase } = locals;
  const { transactionRef } = await request.json();

  
  if (!session.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!orderId) {
    return json({ error: "Order ID is required" }, { status: 400 });
  }

  const order = await ordersRepository.getById(supabase, orderId);

  if (!order || order.user_id !== session.user.id) {
    return json({ error: "Order not found" }, { status: 404 });
  }

  if (order.payment_status === 'paid') {
    return json({ success: true, message: "Payment already verified" }, { status: 200 });
  }

  if (!transactionRef) {
    return json({ error: "Transaction reference is required" }, { status: 400 });
  }

  const payment = await ordersRepository.getPaymentByTransactionRef(supabase, transactionRef);

  if (!payment || payment.order_id !== orderId) {
    return json({ error: "Payment not found for this order" }, { status: 404 });
  }

  const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${transactionRef}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${PRIVATE_PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!verifyResponse.ok) {
    return json({ success: false, error: "Failed to verify payment" }, { status: 502 });
  }

  const verifyData = await verifyResponse.json();

  if (verifyData.status) {
    console.log('Payment verification data:', verifyData.data);
    if (verifyData.data.status === 'success') {
      const { exchange_rate: exchangeRate } = await internalSettingsRepository.getInternalSettings(supabase);
      const amountInNaira = convertAmount(order.total, exchangeRate);
      const amountInKobo = amountInNaira * 100;
      if (verifyData.data.amount !== amountInKobo) {
        console.error('Amount mismatch:', { expected: amountInKobo, received: verifyData.data.amount });
        return json({ success: false, error: "Payment amount does not match order amount" }, { status: 400 });
      }
  
      const { error } = await supabase.rpc('update_payment_status', {
        p_order_id: orderId,
        p_transaction_ref: transactionRef,
        p_status: 'paid'
      });
  
      if (error) {
        console.error('Failed to update payment status:', error);
        return json({ success: false, error: "Failed to update payment status" }, { status: 500 });
      }
  
      return json({ success: true, message: "Payment verified successfully" });
    } else {
      const { error } = await supabase.rpc('update_payment_status', {
        p_order_id: orderId,
        p_transaction_ref: transactionRef,
        p_status: 'failed'
      });

      if (error) {
        console.error('Failed to update payment status to failed:', error);
      }

      return json({ success: false, error: "Payment not successful" }, { status: 400 });
    }
  } else {
    return json({ success: false, error: "Payment verification failed" }, { status: 502 });
  }
}