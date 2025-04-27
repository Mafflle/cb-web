import { browser } from '$app/environment';
import restaurant from '$lib/stores/restaurant.svelte';

const createStore = () => {
	let carts = $state<any>({});
	let loaded = $state(false);
	let loadLocked = $state(false);
	const keys = $derived.by(() => Object.keys(carts));

	const cartCounts = $derived.by(() => {
		let count = 0;
		for (const restaurantId in carts) {
			count += carts[restaurantId].items.reduce((acc: number, item: any) => acc + item.quantity, 0);
		}

		return count;
	});

	const persistCarts = () => {
		localStorage.setItem('carts', JSON.stringify(carts));
	};

	const load = () => {
		if (loadLocked) return;
		loadLocked = true;

		if (browser) {
			const storedCarts = localStorage.getItem('carts');
			if (storedCarts) {
				carts = JSON.parse(storedCarts);
			}
		}

		loaded = true;
		loadLocked = false;
	};

	const addItem = async (restaurantId: string, item: any, quantity: number = 1) => {
		if (!carts[restaurantId]) {
			carts[restaurantId] = {
				restaurantDetails: await restaurant.getById(restaurantId),
				items: [],
				total: 0
			};
		}

		const cart = carts[restaurantId];
		const existingItem = cart.items.find((i: any) => i.id === item.id);

		if (existingItem) {
			existingItem.quantity += quantity;
		} else {
			cart.items.push({ ...item, quantity });
		}

		cart.total += (item.discount_price || item.price) * quantity;
		carts[restaurantId] = cart;
		persistCarts();
	};

	const removeItem = (restaurantId: string, itemId: number, quantity: number = 1) => {
		const cart = carts[restaurantId];
		const itemIndex = cart.items.findIndex((i: any) => i.id === itemId);

		if (itemIndex !== -1) {
			const item = cart.items[itemIndex];
			item.quantity -= quantity;

			if (item.quantity <= 0) {
				cart.items.splice(itemIndex, 1);
			}

			cart.total -= (item.discount_price || item.price) * quantity;

			if (cart.items.length === 0) {
				delete carts[restaurantId];
			} else {
				carts[restaurantId] = cart;
			}

			persistCarts();
		}
	};

	const deleteCart = (restaurantId: string) => {
		delete carts[restaurantId];
		persistCarts();
	};

	const clearCartItems = (restaurantId: string, itemId: number) => {
		const cart = carts[restaurantId];
		const itemIndex = cart.items.findIndex((i: any) => i.id === itemId);

		if (itemIndex !== -1) {
			const item = cart.items[itemIndex];
			cart.total -= (item.discount_price || item.price) * item.quantity;
			cart.items.splice(itemIndex, 1);
		}

		if (cart.items.length === 0) {
			delete carts[restaurantId];
		} else {
			carts[restaurantId] = cart;
		}

		persistCarts();
	};

	const getCart = (restaurantId: string) => {
		if (carts[restaurantId]) {
			return carts[restaurantId];
		}
		return null;
	};

	return {
		get carts() {
			return carts;
		},
		get cartCounts() {
			return cartCounts;
		},
		get loaded() {
			return loaded;
		},
		get keys() {
			return keys;
		},
		load,
		addItem,
		removeItem,
		deleteCart,
		clearCartItems,
		getCart
	};
};

const store = createStore();

export default store;
