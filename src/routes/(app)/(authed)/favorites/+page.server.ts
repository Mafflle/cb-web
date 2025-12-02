import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();

	if (!user) {
		return {
			favorites: [],
			restaurants: []
		};
	}

	// Get user preferences to find favorite restaurant IDs
	const { data: preferences } = await supabase
		.from('user_preferences')
		.select('favorite_restaurants')
		.eq('user_id', user.id)
		.single();

	const favoriteIds = preferences?.favorite_restaurants ?? [];

	if (favoriteIds.length === 0) {
		return {
			favorites: favoriteIds,
			restaurants: []
		};
	}

	// Fetch the restaurant details for favorites
	const { data: restaurants, error } = await supabase
		.from('restaurant')
		.select('*')
		.in('id', favoriteIds);

	if (error) {
		console.error('Error fetching favorite restaurants:', error);
		return {
			favorites: favoriteIds,
			restaurants: []
		};
	}

	return {
		favorites: favoriteIds,
		restaurants: restaurants ?? []
	};
};
