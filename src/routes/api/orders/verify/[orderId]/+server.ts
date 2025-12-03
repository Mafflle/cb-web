import { json, type RequestHandler } from "@sveltejs/kit";
import ordersRepository from "$lib/repositories/orders.repository";
import { convertAmount } from "$lib/utils/helpers";
import { internalSettingsRepository } from '$lib/repositories/internal_settings.repository';
import { paystackService } from "$lib/services/paystack.service";
import { paymentMethods } from "$lib/utils/constants";
import momoService from "$lib/services/momo.service";


export const POST: RequestHandler = async ({ params, locals, request }) => {
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

  try {
    if (payment.payment_method === paymentMethods.PAYSTACK) {
      const verifyData = await paystackService.verifyPayment(transactionRef);
    
      if (verifyData.status) {
        if (verifyData.data.status === 'success') {
          const { exchange_rate: exchangeRate } = await internalSettingsRepository.getInternalSettings(supabase);
          const amountInNaira = convertAmount(order.total, exchangeRate);
          const amountInKobo = amountInNaira * 100;
          if (verifyData.data.amount !== amountInKobo) {
            console.error('Amount mismatch:', { expected: amountInKobo, received: verifyData.data.amount });
            return json({ success: false, error: "Payment amount does not match order amount" }, { status: 400 });
          }
      
          await ordersRepository.updatePaymentStatus(
            supabase,
            orderId,
            transactionRef,
            'paid'
          )
      
          return json({ success: true, message: "Payment verified successfully" });
        } else if (verifyData.data.status === 'pending') {
          return json({ success: false, error: "Payment is still pending. Please complete the payment." }, { status: 400 });
        }
         else {
          return json({ success: false, error: "Payment not successful" }, { status: 400 });
        }
      } else {
        return json({ success: false, error: "Payment verification failed" }, { status: 502 });
      }
    } else if (payment.payment_method === paymentMethods.MOMO) {
      const transactionStatus = await momoService.getTransactionStatus(transactionRef);

      if (transactionStatus.status === 'SUCCESSFUL') {
        const expectedAmount = order.total.toString();
        if (transactionStatus.amount !== expectedAmount) {
          console.error('Amount mismatch:', { expected: expectedAmount, received: transactionStatus.amount });
          return json({ success: false, error: "Payment amount does not match order amount" }, { status: 400 });
        }

        await ordersRepository.updatePaymentStatus(
          supabase,
          orderId,
          transactionRef,
          'paid'
        );

        return json({ success: true, status: 'success', message: "Payment verified successfully" });
      } else if (transactionStatus.status === 'PENDING') {
        return json({ success: false, status: 'pending', error: "Payment is still pending. Please approve on your phone." }, { status: 400 });
      } else if (transactionStatus.status === 'FAILED') {
        return json({ success: false, status: 'failed', error: transactionStatus.reason || "Payment failed" }, { status: 400 });
      } else {
        return json({ success: false, error: "Unknown payment status" }, { status: 400 });
      }
    } else {
      return json({ success: false, error: "Unsupported payment method" }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return json({ success: false, error: "Internal server error during payment verification" }, { status: 500 });
  }
}