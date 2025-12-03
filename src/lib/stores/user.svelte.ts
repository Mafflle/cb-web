import type { SupabaseClient, User } from "@supabase/supabase-js";
import { type Tables, type Database } from "../types/database.types";

const createStore = () => {
  let currentUser = $state<User | null>(null);
  let userPreferences = $state<Tables<'user_preferences'> | null>(null);
  let supabaseClient = $state<SupabaseClient<Database> | null>(null);

  // Derived set for O(1) favorite lookups
  const favoriteRestaurantsSet = $derived(
    new Set(userPreferences?.favorite_restaurants ?? [])
  );

  const loadUserPreferences = async (userId: string, supabase: SupabaseClient<Database>) => {
    supabaseClient = supabase;
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('user_preferences')
          .insert({ user_id: userId })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        userPreferences = newData;
        return;
      }
      throw error;
    }

    userPreferences = data;
  };

  /**
   * Check if a restaurant is in the user's favorites
   */
  const isFavorite = (restaurantId: string): boolean => {
    return favoriteRestaurantsSet.has(restaurantId);
  };

  /**
   * Toggle a restaurant's favorite status
   * Returns the new favorite state
   */
  const toggleFavorite = async (restaurantId: string): Promise<boolean> => {
    if (!currentUser || !supabaseClient || !userPreferences) {
      throw new Error('User must be logged in to manage favorites');
    }

    const currentFavorites = userPreferences.favorite_restaurants ?? [];
    const isCurrentlyFavorite = currentFavorites.includes(restaurantId);
    
    let newFavorites: string[];
    if (isCurrentlyFavorite) {
      newFavorites = currentFavorites.filter(id => id !== restaurantId);
    } else {
      newFavorites = [...currentFavorites, restaurantId];
    }

    userPreferences = { ...userPreferences, favorite_restaurants: newFavorites };

    const { error } = await supabaseClient
      .from('user_preferences')
      .update({ favorite_restaurants: newFavorites })
      .eq('user_id', currentUser.id);

    if (error) {
      userPreferences = { ...userPreferences, favorite_restaurants: currentFavorites };
      throw error;
    }

    return !isCurrentlyFavorite;
  };

  /**
   * Add a restaurant to favorites
   */
  const addFavorite = async (restaurantId: string): Promise<void> => {
    if (isFavorite(restaurantId)) return;
    await toggleFavorite(restaurantId);
  };

  /**
   * Remove a restaurant from favorites
   */
  const removeFavorite = async (restaurantId: string): Promise<void> => {
    if (!isFavorite(restaurantId)) return;
    await toggleFavorite(restaurantId);
  };



  const load = async (user: User | null, supabase: SupabaseClient<Database>) => {
    try {
      currentUser = user;
      if (user) {
        await loadUserPreferences(user.id, supabase);
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
      throw error;
    }
  }

  return {
    get currentUser() { return currentUser },
    get userPreferences() { return userPreferences },
    get favoriteRestaurants() { return userPreferences?.favorite_restaurants ?? [] },
    load,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite
  }
}


const userStore = createStore();
export default userStore;