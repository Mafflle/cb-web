import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '../types/database.types';

export type Order = Tables<'orders'> & {
	order_items: (Tables<'order_items'> & {
		items: Tables<'items'>;
	})[];
	restaurant: Tables<'restaurant'>;
};

export type OrderInput = {
	restaurantId: string;
	items: any[];

	name: string;
	address: string;
	phone: string;
	specialInstructions?: string;
};

const createRepo = () => {
	const getAll = async (supabase: SupabaseClient, userId: string): Promise<Order[]> => {
		const { data, error } = await supabase
			.from('orders')
			.select('*, order_items(*, items (*)), restaurant(*)')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		return data;
	};

	const getById = async (supabase: SupabaseClient, id: string): Promise<Order | null> => {
		const { data, error } = await supabase
			.from('orders')
			.select('*, order_items(*, items (*)), restaurant(*)')
			.eq('id', id)
			.single();

		if (error) {
			throw error;
		}

		return data;
	};

	const getPaymentByTransactionRef = async (
		supabase: SupabaseClient<Database>,
		transactionRef: string
	): Promise<Tables<'payments'> | null> => {
		const { data, error } = await supabase.from('payments').select('*').eq('transaction_reference', transactionRef).single();

		if (error) {
			throw error;
		}

		return data;
	}

	const subscribeToOrderChanges = async (
		supabase: SupabaseClient,
		orderId: string,
		callback: (order: Order) => void
	) => {
		const filter = `id=eq.${orderId}`;
		const channel = supabase.channel(`order-changes-${orderId}`).on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'orders',
				filter: filter
			},
			(payload) => {
				console.log('Order change received:', payload);
				if (payload.new) {
					callback(payload.new as Order);
				}
			}
		);

		await channel.subscribe((status) => {
			if (status === 'SUBSCRIBED') {
				console.log(`Subscribed to order changes for order ID: ${orderId}`);
			}
		});

		return channel;
	};

	const placeOrder = async (supabase: SupabaseClient, order: OrderInput, userId: string) => {
		const orderData = {
			...order,
			userId
		};

		const { data, error } = await supabase.rpc('place_order', {
			user_id: userId,
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

			return orderData;
		}
	};

	const verifyOrderPayment = async (
		supabase: SupabaseClient,
		orderId: string,
		transactionRef: string
	): Promise<boolean> => {
		try {
			const response = await fetch(`/api/orders/verify/${orderId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ transactionRef })
			})

			if (!response.ok) {
				console.error('Failed to verify payment:', response.statusText);
				return false;
			}

			const result = await response.json();
			return result.success === true;
		} catch (error) {
			console.error('Error verifying payment:', error);
			return false;
		}
	};

	return {
		getAll,
		getById,
		subscribeToOrderChanges,
		placeOrder,
		verifyOrderPayment,
		getPaymentByTransactionRef
	};
};

const ordersRepository = createRepo();

export default ordersRepository;
