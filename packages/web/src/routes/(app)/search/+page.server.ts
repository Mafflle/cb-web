import restaurantRepository from "$lib/repositories/restaurant.repository";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const query = url.searchParams.get('q') || '';
  
  if (!query.trim()) {
    return {
      query: '',
      restaurants: [],
      items: [],
    };
  }

  try {
    const { restaurants, items } = await restaurantRepository.searchAll(locals.supabase, query);
    
    return {
      query,
      restaurants,
      items,
    };
  } catch (err) {
    console.error("Error searching:", err);
    throw error(500, 'Error performing search');
  }
};
