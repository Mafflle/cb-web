import { browser } from "$app/environment";
import supabase from "../supabase";
import type { Tables } from "../types/database.types";

const createStore = () => {
  let loading = $state(false);
  let loaded = $state(false);
  let loadLocked = $state(false);
  let currencies = $state<{
    [code: string]: Tables<'currencies'>
  }>({});
  let activeCurrency = $state<Tables<'currencies'> | null>(null);
  let deliveryFee = $state<number>(0);
  let serviceCharge = $state<number>(0);

  const setActiveCurrency = (currency: string) => {
    const selectedCurrency = currencies[currency];
    if (selectedCurrency) {
      activeCurrency = selectedCurrency;
      if (browser) {
        localStorage.setItem('activeCurrency', selectedCurrency.code);
      }
    } else {
      console.error(`Currency ${currency} not found`);
    }
  }

  const getActiveCurrency = () => {
    if (browser) {
      const storedCurrency = localStorage.getItem('activeCurrency');
      if (storedCurrency) {
        const selectedCurrency = currencies[storedCurrency];
        if (selectedCurrency) {
          activeCurrency = selectedCurrency;
          return selectedCurrency;
        } 
      }

      // If no stored currency, set the currency with is_default = true
      const defaultCurrency = Object.values(currencies).find(currency => currency.is_default);
      if (defaultCurrency) {
        activeCurrency = defaultCurrency;
        localStorage.setItem('activeCurrency', defaultCurrency.code);
      }
      else {
        const firstCurrency = Object.values(currencies)[0];
        if (firstCurrency) {
          activeCurrency = firstCurrency;
          localStorage.setItem('activeCurrency', firstCurrency.code);
        }
      }
      
    } 
  }

  const handleCurrencyData = (data: Tables<'currencies'>[]) => {
    if (data && data.length > 0) {
      currencies = data.reduce((obj: {
        [code: string]: Tables<'currencies'>
      }, item) => {
        obj[item.code] = item;
        return obj;
      }, {});
    } else {
      console.error('No currencies found');
    }
  }
    


  const loadCurrencies = async () => {
    const { data: currenciesData, error: currenciesError } = await supabase
      .from('currencies')
      .select('*');

    if (currenciesError) {
      console.error('Error loading currencies:', currenciesError);
      return;
    }

    handleCurrencyData(currenciesData || []);
    getActiveCurrency();

    await supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'currencies',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCurrency = payload.new;
            currencies[newCurrency.code] = newCurrency as Tables<'currencies'>;
          } else if (payload.eventType === 'UPDATE') {
            const updatedCurrency = payload.new;
            currencies[updatedCurrency.code] = updatedCurrency as Tables<'currencies'>;
          } else if (payload.eventType === 'DELETE') {
            const deletedCurrency = payload.old;
            delete currencies[deletedCurrency.code];
          }
        }
      )
      .subscribe()
  }

  const loadInternalSettings = async () => {
    const { data: settingsData, error: settingsError } = await supabase
      .from('internal_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .single()

    if (settingsError) {
      console.error('Error loading settings:', settingsError);
      return;
    }

    if (settingsData) {
      deliveryFee = settingsData.delivery_fee || 0;
      serviceCharge = settingsData.service_charge || 0;
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

  const getConvertedPrice = (price: number, currency: string ) => {
    const selectedCurrency = currencies[currency];
    if (selectedCurrency) {
      const conversionRate = selectedCurrency.rate_to_xof;
      if (!conversionRate) {
        console.error(`Conversion rate for currency ${currency} not found`);
        return price;
      }
      
      return Math.ceil(price / conversionRate);
    } else {
      console.error(`Currency ${currency} not found`);
      return price;
    }
  }

  const formatPrice = (price: number, currency?: string) => {
    if (!activeCurrency) {
      getActiveCurrency();
      if (!activeCurrency) {
        console.error('No active currency found');
        return price;
      }
    }

    if (!currency) {
      currency = activeCurrency.code;
    }

    const selectedCurrency = currencies[currency];

    const convertedPrice = getConvertedPrice(price, currency);

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currencySign: 'accounting',
      currencyDisplay: 'code',
      compactDisplay: 'short',
      
    }).format(convertedPrice).replace(selectedCurrency.code, selectedCurrency.symbol);

    return formattedPrice;

  }


  const load = async () => {
    if (loadLocked) {
      return;
    }
    loadLocked = true;
    loading = true;

    await loadCurrencies();
    await loadInternalSettings();

    loaded = true;
    loading = false;
    loadLocked = false;
  }

  return {
    get loading() {
      return loading;
    },
    get loaded() {
      return loaded;
    },
    get currencies() {
      return currencies;
    },
    get activeCurrency() {
      return activeCurrency;
    },
    get deliveryFee() {
      return deliveryFee;
    },
    get serviceCharge() {
      return serviceCharge;
    },
    load,
    setActiveCurrency,
    getConvertedPrice,
    formatPrice,

  }
};

const store = createStore();

export default store;