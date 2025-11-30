import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "../types/database.types";

const createRepo = () => {

  const getInternalSettings = async (supabase: SupabaseClient<Database>): Promise<Tables<'internal_settings'>> => {
    const { data, error } = await supabase
			.from('internal_settings')
			.select('*')
			.order('created_at', { ascending: false })
			.single();

    if (error) {
      throw error;
    }

    return data;
  }

  const subscribeToInternalSettingsChanges = async (supabase: SupabaseClient<Database>, callback: (settings: Tables<'internal_settings'>) => void) => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internal_settings',
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as Tables<'internal_settings'>);
          }
        }
      )
      

    await channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to internal_settings changes');
      }
    });

    return channel;
  }

  return {
    getInternalSettings, 
    subscribe: subscribeToInternalSettingsChanges,
  }
}

export const internalSettingsRepository = createRepo();
export default internalSettingsRepository;