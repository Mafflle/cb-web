import { type VerifyTransactionResponse } from '$lib/services/paystack/types';
import { PRIVATE_PAYSTACK_SECRET_KEY } from '$env/static/private';

export const POST = async ({ params, fetch, locals }) => {
  const { ordersId } = params;

  const supabase = locals.supabase;
  
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Supabase client not available' }), { status: 500 });
  }


  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', ordersId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: orderError?.message || 'Order not found' }), { status: 404 });
    }

    const reference = order.payment_reference;
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PRIVATE_PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({ error: errorData.message || "Failed to verify transaction" }), { status: response.status });
    }

    const data: VerifyTransactionResponse = await response.json();

    const { data: internalSettings, error: internalError } = await supabase
      .from('internal_settings')
      .select('*')
      .single();

    if (internalError || !internalSettings) {
      return new Response(JSON.stringify({ error: internalError?.message || 'Internal settings not found' }), { status: 500 });
    }

    const expectedAmount = order.total_price * 100; 

    if (data.status && data.data.status === "success" && data.data.amount === expectedAmount) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', ordersId);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
      }
    }
    
    
    return new Response(JSON.stringify({
      success: true
    }), { status: 200 });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }

  
}