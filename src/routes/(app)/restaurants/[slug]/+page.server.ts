import restaurantRepository from "$lib/repositories/restaurant.repository";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  try {
    const restaurant = await restaurantRepository.getBySlug(locals.supabase, params.slug);
    const items = await restaurantRepository.getItemsByRestaurantId(locals.supabase, restaurant.id);
    const featuredItems = await restaurantRepository.getFeaturedItemsByRestaurantId(locals.supabase, restaurant.id);

    if (!restaurant || !items) {
      throw error(404, 'There was a problem loading the restaurant');
    }

    return { 
      restaurant, 
      items, 
      featuredItems
     };
  } catch (err) {
    console.error("Error loading restaurant:", err);
    throw error(500, 'Internal Server Error');
  }
}