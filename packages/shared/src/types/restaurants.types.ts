import type { Tables } from "@chowbenin/shared/types";

export type RestaurantOpeningHours = {
  [day: string]: {
    open: string | null;
    close: string | null;
  };
};
export type Restaurant = Tables<'restaurant'> & { opening_hours: RestaurantOpeningHours };
export type RestaurantWithItems = Restaurant & { items: Tables<'items'>[] };
