import { error } from '@sveltejs/kit';
import ordersRepository, { type Order } from "$lib/repositories/orders.repository";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  try {
  const {supabase, session} = locals;

  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const orders: Order[] = await ordersRepository.getAll(supabase, session.user.id);

  return { orders };
  } catch (err) {
    console.error("Error loading orders:", err);
    throw error(500, 'Internal Server Error');
  }
}