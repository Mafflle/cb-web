import restaurantRepository from "$lib/repositories/restaurant.repository";
import { type Actions, error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async ({locals}) => {
  try {
    const featuredRestaurants = await restaurantRepository.getFeatured(locals.supabase);
    const restaurants = await restaurantRepository.getAll(locals.supabase);
    return { featuredRestaurants, restaurants };
  } catch (err) {
    console.error("Error loading restaurants:", err);
    throw error(500, 'Internal Server Error');
  }
};

export const actions: Actions = {
  logout: async ({ locals }) => {
    await locals.supabase.auth.signOut();
    return { success: true };
  },
}