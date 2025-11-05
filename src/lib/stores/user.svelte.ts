import type { SupabaseClient, User } from "@supabase/supabase-js";
import { type Tables, type Database } from "../types/database.types";

const createStore = () => {
  let currentUser = $state<User | null>(null);
  let userPreferences = $state<Tables<'user_preferences'> | null>(null);

  const loadUserPreferences = async (userId: string, supabase: SupabaseClient<Database>) => {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // TODO: Create the user preferences if they don't exist
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    userPreferences = data;
  }



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
    load
  }
}


const userStore = createStore();
export default userStore;