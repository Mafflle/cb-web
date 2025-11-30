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

    if (error) {
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('user_preferences')
          .insert({ user_id: userId })
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