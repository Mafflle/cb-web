import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database, Tables } from '@chowbenin/shared/types';

type RestaurantUser = Tables<'restaurant_users'> & {
	restaurant: Tables<'restaurant'> | null;
};

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			restaurantUser: RestaurantUser | null;
			restaurant: Tables<'restaurant'> | null;
		}
		interface PageData {
			session: Session | null;
			restaurantUser: RestaurantUser | null;
			restaurant: Tables<'restaurant'> | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
