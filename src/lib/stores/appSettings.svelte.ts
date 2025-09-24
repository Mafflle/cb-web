import { type Database } from "../types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

const createStore = () => {
  let loading = $state(false);
  let loaded = $state(false);
  let loadLocked = $state(false);
  let deliveryFee = $state<number>(0);
  let serviceCharge = $state<number>(0);
  let exchangeRate = $state<number>(1); 

  const loadInternalSettings = async (supabase: SupabaseClient<Database>) => {
    const { data: settingsData, error: settingsError } = await supabase
    .from('internal_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .single();

    if (settingsError) {
      console.error('Error loading settings:', settingsError);
      return;
    }

    if (settingsData) {
      deliveryFee = settingsData.delivery_fee;
      serviceCharge = settingsData.service_charge;
      exchangeRate = settingsData.exchange_rate;
    }

    await supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internal_settings',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedSettings = payload.new;
            deliveryFee = updatedSettings.delivery_fee || 0;
            serviceCharge = updatedSettings.service_charge || 0;
          }
        }
      )
      .subscribe()
  }

  const getConvertedPrice = (price: number ) => {
    if (!loaded) 
      throw new Error("Settings not loaded");
    return Math.ceil(price / exchangeRate);
  }

  const formatPrice = (price: number) => {
    const formattedPrice = new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: "XOF",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currencySign: 'accounting',
      currencyDisplay: 'code',
      compactDisplay: 'short',

    }).format(price).replace("XOF", "CFA");

    return formattedPrice;
  }


  const load = async (supabase: SupabaseClient<Database>) => {
    try {
      if (loadLocked) {
        return;
      }
      loadLocked = true;
      loading = true;
      await loadInternalSettings(supabase);
      loaded = true;
    } catch (error) {
      console.error("Error loading app settings:", error);
    } finally {
      loading = false;
      loadLocked = false;
    }
  }

  return {
    get loading() {
      return loading;
    },
    get loaded() {
      return loaded;
    },
    get deliveryFee() {
      return deliveryFee;
    },
    get serviceCharge() {
      return serviceCharge;
    },
    load,
    getConvertedPrice,
    formatPrice,

  }
};

const store = createStore();

export default store;