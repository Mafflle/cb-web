import restaurantRepository from '$lib/repositories/restaurant.repository';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const restaurant = await restaurantRepository.getBySlug(locals.supabase, params.slug);

		// Check if restaurant exists before fetching items
		if (!restaurant) {
			throw error(404, 'Restaurant not found');
		}

		const items = await restaurantRepository.getItemsByRestaurantId(
			locals.supabase,
			restaurant.id
		);
		const featuredItems = await restaurantRepository.getFeaturedItemsByRestaurantId(
			locals.supabase,
			restaurant.id
		);

		return {
			restaurant,
			items,
			featuredItems
		};
	} catch (err: any) {
		// Re-throw if it's already a SvelteKit error (like our 404)
		if (err?.status) {
			throw err;
		}

		// Check if it's a "not found" error from Supabase (.single() returns PGRST116)
		if (err?.code === 'PGRST116') {
			throw error(404, 'Restaurant not found');
		}

		console.error('Error loading restaurant:', err);
		throw error(500, 'Internal Server Error');
	}
};