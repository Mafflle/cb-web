import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "../types/database.types";

export type Order = Tables<"orders"> & {
  order_items: (Tables<"order_items"> & {
    items: Tables<"items">;
  })[];
  restaurant: Tables<"restaurant">;
};

export type OrderInput = {
	restaurantId: string;
	items: any[];

	name: string;
	address: string;
	phone: string;
	specialInstructions?: string;
}

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

	const subscribeToOrderChanges = async (supabase: SupabaseClient, orderId: string, callback: (order: Order) => void) => {
		return await supabase.channel('schema-db-changes').on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'orders',
				filter: `id=eq.${orderId}`,
			},
			(payload) => {
				if (payload.new) {
					callback(payload.new as Order);
				}
			}
		).subscribe();
	};

	const placeOrder = async (supabase: SupabaseClient, order: OrderInput, userId: string) => {

		// Create the order object
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

  return {
    getAll,
    getById,
		subscribeToOrderChanges,
		placeOrder
  };
}

const ordersRepository = createRepo();

export default ordersRepository;