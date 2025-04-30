import supabase from '../supabase';
import auth from '$lib/stores/auth.svelte';
import cart from '$lib/stores/cart.svelte';
import monnify from '$lib/services/monnify';
import { showToast } from '../utils/toaster.svelte';
import { goto } from '$app/navigation';
import type { Tables } from '../types/database.types';

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
	let orders = $state<any>({});
	const keys = $derived.by(() => Object.keys(orders));
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

			orders[orderData.id] = orderData;
			// Clear the cart after placing the order
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

	const pay = async (orderId: string, currency: 'naira' | 'xof') => {
		if (!auth.currentUser) {
			await auth.load();
			if (!auth.currentUser) {
				throw new Error('User not authenticated');
			}
		}

		const order: Tables<'restaurant'> = orders[orderId];

		if (!order) {
			throw new Error('Order not found');
		}

		if (
			(order.payment_status !== 'pending' && order.payment_status !== 'failed') ||
			order.status === 'cancelled'
		) {
			throw new Error('Order already paid or cancelled');
		}

		if (currency === 'naira') {
			// Convert the amount to Naira
			let amount = order.total * 2.779;
			// Round up to two decimal places
			amount = Math.ceil(amount * 100) / 100;

			await monnify.initialize(
				{
					amount: amount,
					email: 'chowbenin@gmail.com',
					fullName: 'Chow Benin',
					description: `Order #${orderId} payment`
				},
				(response) => {
					if (response.status === 'SUCCESS') {
						orders[orderId] = {
							...orders[orderId],
							payment_status: 'paid'
						};
					}
				}
			);
		} else if (currency === 'xof') {
			throw new Error('XOF payment is not supported yet');
		} else {
			throw new Error('Invalid currency');
		}
	};

	const getOrders = async () => {
		const { data, error } = await supabase
			.from('orders')
			.select('*, order_items(*, items (*)), restaurant(*)')
			.eq('user_id', auth.currentUser.id)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error loading orders:', error);
			throw new Error(`Error loading orders: ${error.message}`);
		}

		if (data) {
			orders = data.reduce((obj: any, item: any) => {
				obj[item.id] = item;
				return obj;
			}, {});
		}
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

		await getOrders();

		supabase
			.channel('schema-db-changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'orders',
					filter: `user_id=eq.${auth.currentUser.id}`
				},
				(payload) => {
					if (payload.eventType === 'UPDATE') {
						const updatedOrder = payload.new;
						const oldOrder = orders[payload.old.id];

						if (oldOrder) {
							orders[payload.old.id] = {
								...oldOrder,
								...updatedOrder
							};

							if (oldOrder.order_status !== updatedOrder.order_status) {
								const status = updatedOrder.order_status;
								const action = {
									label: 'View Order',
									onClick: () => goto(`/orders/${updatedOrder.id}`)
								};

								if (window.location.pathname !== `/orders/${payload.new.id}`) {
									const orderNo = updatedOrder.id.split('-')[0];
									switch (status) {
										case 'confirmed':
											showToast({
												message: `Order #${orderNo} confirmed`,
												type: 'info',
												action
											});
											break;
										case 'in_preparation':
											showToast({
												message: `Order #${orderNo} is being prepared`,
												type: 'info',
												action
											});
											break;
										case 'out_for_delivery':
											showToast({
												message: `Order #${orderNo} is out for delivery`,
												type: 'info',
												action
											});
											break;
										case 'delivered':
											showToast({
												message: `Order #${orderNo} has been delivered`,
												type: 'success',
												action
											});
											break;
										case 'cancelled':
											showToast({
												message: `Order #${orderNo} was cancelled`,
												type: 'error',
												action
											});
											break;
										case 'failed':
											showToast({
												message: `Order #${orderNo} has failed`,
												type: 'error',
												action
											});
											break;
										case 'refunded':
											showToast({
												message: `Order #${orderNo} has been refunded`,
												type: 'error',
												action
											});
											break;
										default:
											showToast({
												message: `Order #${orderNo} status changed to ${status}`,
												type: 'info',
												action
											});
											break;
									}
								}
							}
						} else {
							orders[payload.new.id] = updatedOrder;
						}
					}
				}
			)
			.subscribe();

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
		get keys() {
			return keys;
		},
		placeOrder,
		load,
		getOrderDetails,
		pay
	};
};

const store = createStore();
export default store;
