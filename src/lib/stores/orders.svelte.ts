import supabase from '../supabase';
import auth from '$lib/stores/auth.svelte';
import cart from '$lib/stores/cart.svelte';

interface OrderInput {
	restaurantId: string;
	items: any[];

	name: string;
	address: string;
	phone: string;
	whatsapp: string;
	specialInstructions?: string;
}

const createStore = () => {
	let orders = $state<any>([]);
	let loadLocked = $state(false);
	let loading = $state(false);
	let loaded = $state(false);

	const placeOrder = async (order: OrderInput) => {
		if (!auth.currentUser) {
			throw new Error('User not authenticated');
		}

		// Create the order object
		const orderData = {
			...order,
			userId: auth.currentUser.id
		};

		const { data, error } = await supabase.rpc('place_order', {
			user_id: auth.currentUser.id,
			order_data: orderData
		});

		if (error) {
			console.error('Error placing order:', error);
			throw new Error(`Error placing order: ${error.message}`);
		}

		if (data) {
			const { data: orderData, error: orderError } = await supabase
				.from('orders')
				.select('*, order_items(*), restaurant(*)')
				.eq('id', data)
				.single();

			if (orderError) {
				console.error('Error fetching order data:', orderError);
				throw new Error(`Error fetching order data: ${orderError.message}`);
			}

			orders = [...orders, orderData];
			cart.deleteCart(order.restaurantId);
			return orderData;
		}
	};

	const getOrderDetails = async (orderId: string) => {
		if (!auth.currentUser) {
			await auth.load();
			if (!auth.currentUser) {
				throw new Error('User not authenticated');
			}
		}

		const { data, error } = await supabase
			.from('orders')
			.select('*, order_items(*, items (*)), restaurant(*)')
			.eq('id', orderId)
			.eq('user_id', auth.currentUser.id)
			.single();

		if (error) {
			console.error('Error fetching order details:', error);
			return [];
		}

		return data;
	};

	const load = async () => {
		if (loadLocked) return;
		loadLocked = true;
		loading = true;

		if (!auth.currentUser) {
			await auth.load();
			if (!auth.currentUser) {
				loading = false;
				loadLocked = false;
				loaded = true;
			}
		}

		const { data, error } = await supabase
			.from('orders')
			.select('*, order_items(*), restaurant(*)')
			.eq('user_id', auth.currentUser.id)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error loading orders:', error);
			throw new Error(`Error loading orders: ${error.message}`);
		}

		if (data) {
			orders = data;
		}

		loaded = true;
		loading = false;
		loadLocked = false;
	};

	return {
		get orders() {
			return orders;
		},
		get loading() {
			return loading;
		},
		get loaded() {
			return loaded;
		},
		placeOrder,
		load,
		getOrderDetails
	};
};

const store = createStore();
export default store;
