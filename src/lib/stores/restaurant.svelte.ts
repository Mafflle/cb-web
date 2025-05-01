import supabase from '../supabase';
import type { Tables } from '../types/database.types';

const createStore = () => {
	let loaded = $state(false);
	let loading = $state(false);
	let loadLocked = $state(false);
	let restaurantsById = $state<{
		[id: string]: Tables<'restaurant'>
	}>({});
	let restaurantsBySlug = $state<{
		[slug: string]: Tables<'restaurant'>
	}>({});
	const keys = $derived.by(() => {
		return Object.keys(restaurantsById);
	});

	const getById = async (id: string) => {
		if (restaurantsById[id]) {
			return restaurantsById[id];
		}

		// Fetch the restaurant by ID from the database
		const { data, error } = await supabase
			.from('restaurant')
			.select('id, name, slug, description, whatsapp, phone_no, address, logo, cover_image')
			.eq('id', id)
			.single();

		if (error) {
			console.error('Error fetching restaurant by ID:', error);
			return null;
		}

		if (data) {
			// Update the local store with the fetched restaurant
			restaurantsById[data.id] = data as Tables<'restaurant'>;
			restaurantsBySlug[data.slug] = data as Tables<'restaurant'>;
			return data;
		}

		return null;
	};

	const getBySlug = async (slug: string) => {
		if (restaurantsBySlug[slug]) {
			return restaurantsBySlug[slug];
		}

		// Fetch the restaurant by slug from the database
		const { data, error } = await supabase
			.from('restaurant')
			.select('id, name, slug, description, whatsapp, phone_no, address, logo, cover_image')
			.eq('slug', slug)
			.single();

		if (error) {
			console.error('Error fetching restaurant by slug:', error);
			return null;
		}

		if (data) {
			// Update the local store with the fetched restaurant
			restaurantsById[data.id] = data as Tables<'restaurant'>;
			restaurantsBySlug[data.slug] = data as Tables<'restaurant'>;
			return data;
		}

		return null;
	};

	const handleRestaurantData = (data: any, clear = false) => {
		if (clear) {
			restaurantsById = {};
			restaurantsBySlug = {};
		}

		restaurantsById = data.reduce((obj: any, item: any) => {
			const { id, ...rest } = item;
			obj[id] = rest;

			restaurantsBySlug[item.slug] = item;
			return obj;
		}, {});
	};

	const loadRestaurants = async () => {
		const { data, error } = await supabase
			.from('restaurant')
			.select('id, name, slug, description, whatsapp, phone_no, address, logo, cover_image');

		if (error) {
			throw error;
		}

		handleRestaurantData(data, true);
	};

	const load = async () => {
		if (loadLocked) return;
		loadLocked = true;
		loading = true;
		try {
			await loadRestaurants();
			loaded = true;
		} catch (e) {
			console.error(e);
		} finally {
			loadLocked = false;
			loading = false;
		}
	};

	const search = async (name: string) => {
		if (loadLocked) return;
		loadLocked = true;
		loading = true;
		try {
			const { data, error } = await supabase
				.from('restaurant')
				.select('id, name, slug, description, whatsapp, phone_no, address, logo, cover_image')
				.ilike('name', `%${name}%`);

			if (error) {
				throw error;
			}

			handleRestaurantData(data, true);

			loaded = true;
		} catch (e) {
			console.error(e);
		} finally {
			loadLocked = false;
			loading = false;
		}
	};

	return {
		get loaded() {
			return loaded;
		},
		get loading() {
			return loading;
		},
		get restaurants() {
			return restaurantsById;
		},
		get keys() {
			return keys;
		},
		load,
		search,
		getById,
		getBySlug
	};
};

const store = createStore();

export default store;
