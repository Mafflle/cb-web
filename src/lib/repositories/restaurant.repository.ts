import { type SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "../types/database.types";

type Restaurant = Tables<"restaurant">;
type RestaurantWithItems = Tables<"restaurant"> & { items: Tables<"items">[] };

const createRepo = () => {
  const getAll = async (supabase: SupabaseClient): Promise<Restaurant[]> => {
    const {data, error} = await supabase
      .from('restaurant')
      .select('*');

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
    getBySlug,
    getById,
    search
  }
}

const restaurantRepository = createRepo();

export default restaurantRepository;