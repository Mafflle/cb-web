import type { Tables } from "./database.types";

export type Restaurant = Tables<'restaurant'>;
export type RestaurantWithItems = Tables<'restaurant'> & { items: Tables<'items'>[] };
