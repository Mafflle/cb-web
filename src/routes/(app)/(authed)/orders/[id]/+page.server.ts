import ordersRepository from "$lib/repositories/orders.repository";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  try {

    const order = await ordersRepository.getById(locals.supabase, params.id);
  
    if (!order) {
      throw error(404, 'Order Not Found');
    }

    return { order };
  } catch (err) {
    console.error("Error loading order:", err);
    throw error(500, 'Internal Server Error');
  }
};