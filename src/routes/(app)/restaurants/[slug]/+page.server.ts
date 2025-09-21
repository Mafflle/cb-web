import restaurantRepository from "$lib/repositories/restaurant.repository";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  try {
    const restaurant = await restaurantRepository.getBySlug(locals.supabase, params.slug);

    if (!restaurant) {
      throw error(404, 'Restaurant not found');
    }

    return { restaurant };
  } catch (err) {
    console.error("Error loading restaurant:", err);
    throw error(500, 'Internal Server Error');
  }
}