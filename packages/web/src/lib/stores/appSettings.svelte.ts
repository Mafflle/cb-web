import internalSettingsRepository from "../repositories/internal_settings.repository";
import { type Database } from "@chowbenin/shared/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const createStore = () => {
  let loading = $state(false);
  let loaded = $state(false);
  let loadLocked = $state(false);
  let deliveryFee = $state<number>(0);
  let serviceCharge = $state<number>(0);
  let exchangeRate = $state<number>(1); 

  const loadInternalSettings = async (supabase: SupabaseClient<Database>) => {
    const settingsData = await internalSettingsRepository.getInternalSettings(supabase);

    if (settingsData) {
      deliveryFee = settingsData.delivery_fee;
      serviceCharge = settingsData.service_charge;
      exchangeRate = settingsData.exchange_rate;
    }

    await internalSettingsRepository.subscribe(supabase, (newSettings) => {
      deliveryFee = newSettings.delivery_fee;
      serviceCharge = newSettings.service_charge;
      exchangeRate = newSettings.exchange_rate;
    });
  }

  const getConvertedPrice = (price: number ) => {
    if (!loaded) 
      throw new Error("Settings not loaded");
    return Math.ceil(price / exchangeRate);
  }

  const formatPrice = (price: number, currency: "XOF" | "NGN" = "XOF") => {
    if (currency === "NGN") {
      const formattedPrice = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: "NGN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        currencySign: 'accounting',
        currencyDisplay: 'code',
        compactDisplay: 'short',
      }).format(price).replace("NGN", "");

      return "₦ " + formattedPrice;
    }
    
    const formattedPrice = new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: "XOF",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currencySign: 'accounting',
      currencyDisplay: 'code',
      compactDisplay: 'short',

    }).format(price).replace("XOF", "");

    return "CFA " +formattedPrice;
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