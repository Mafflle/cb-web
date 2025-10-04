import { type SupabaseClient } from "@supabase/supabase-js";
import type { Restaurant, RestaurantWithItems } from "../types/restaurants.types";
import type { Database, Tables } from "../types/database.types";


const createRepo = () => {
  const getAll = async (supabase: SupabaseClient<Database>): Promise<Restaurant[]> => {
    const {data, error} = await supabase
      .from('restaurant')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Restaurant[];
  }

  const getFeatured = async (supabase: SupabaseClient): Promise<Restaurant[]> => {
    const {data, error} = await supabase
      .from('restaurant')
      .select('*')
      .order('updated_at', { ascending: false })
      .eq('is_featured', true);

    if (error) throw error;
    return data;
  }

  const getBySlug = async (supabase: SupabaseClient, slug: string): Promise<RestaurantWithItems> => {
    const {data, error} = await supabase
      .from('restaurant')
      .select('*, items(*)')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  }

  const getById = async (supabase: SupabaseClient, id: number): Promise<RestaurantWithItems> => {
    const {data, error} = await supabase
      .from('restaurant')
      .select('*, items(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  const getItemsByRestaurantId = async (supabase: SupabaseClient<Database>, restaurantId: string): Promise<Tables<'items'>[]> => {
    const {data, error} = await supabase
      .from('items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  const getFeaturedItemsByRestaurantId = async (supabase: SupabaseClient<Database>, restaurantId: string): Promise<Tables<'items'>[]> => {
    const {data, error} = await supabase
      .from('items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_featured', true)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  const search = async (supabase: SupabaseClient, query: string): Promise<Restaurant[]> => {
    const {data, error} = await supabase
      .from('restaurant')
      .select('*')
      .ilike('name', `%${query}%`);
    if (error) throw error;
    return data;
  }

  return {
    getAll,
    getFeatured,
    getBySlug,
    getById,
    search,
    getItemsByRestaurantId,
    getFeaturedItemsByRestaurantId
  }
}

const restaurantRepository = createRepo();

export default restaurantRepository;