create type "public"."order_status" as enum ('pending_confirmation', 'confirmed', 'in_preparation', 'out_for_delivery', 'delivered', 'cancelled', 'failed', 'refunded');

create type "public"."payment_status" as enum ('pending', 'paid', 'failed', 'refunded');

create table "public"."internal_settings" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "delivery_fee" numeric,
    "service_charge" numeric,
    "exchange_rate" bigint
);


alter table "public"."internal_settings" enable row level security;

create table "public"."items" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "price" numeric(10,2),
    "discount_price" numeric(10,2),
    "image" text not null,
    "menu_category_id" uuid,
    "restaurant_id" uuid,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter table "public"."items" enable row level security;

create table "public"."menu_category" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text not null,
    "cover_image" text not null,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter table "public"."menu_category" enable row level security;

create table "public"."order_items" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "order_id" uuid not null,
    "menu_item_id" uuid not null,
    "quantity" smallint not null,
    "price" numeric not null
);


alter table "public"."order_items" enable row level security;

create table "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "name" text not null,
    "address" text not null,
    "phone" text not null,
    "whatsapp" text not null,
    "special_instructions" text not null,
    "payment_status" payment_status not null default 'pending'::payment_status,
    "order_status" order_status not null default 'pending_confirmation'::order_status,
    "restaurant_id" uuid not null,
    "total_price" numeric not null,
    "delivery_fee" numeric not null,
    "service_charge" numeric not null,
    "total" numeric not null default '10000'::numeric
);


alter table "public"."orders" enable row level security;

create table "public"."restaurant" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text not null,
    "whatsapp" text not null,
    "phone_no" text not null,
    "address" text not null,
    "logo" text not null,
    "cover_image" text not null,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "is_active" boolean not null default false,
    "slug" text not null default 'test'::text
);


alter table "public"."restaurant" enable row level security;

CREATE INDEX idx_menu_item_category_id ON public.items USING btree (menu_category_id);

CREATE INDEX idx_menu_item_restaurant_id ON public.items USING btree (restaurant_id);

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);

CREATE UNIQUE INDEX internal_settings_pkey ON public.internal_settings USING btree (id);

CREATE UNIQUE INDEX menu_category_pkey ON public.menu_category USING btree (id);

CREATE UNIQUE INDEX menu_item_pkey ON public.items USING btree (id);

CREATE UNIQUE INDEX order_item_pkey ON public.order_items USING btree (id);

CREATE UNIQUE INDEX order_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX restaurant_pkey ON public.restaurant USING btree (id);

alter table "public"."internal_settings" add constraint "internal_settings_pkey" PRIMARY KEY using index "internal_settings_pkey";

alter table "public"."items" add constraint "menu_item_pkey" PRIMARY KEY using index "menu_item_pkey";

alter table "public"."menu_category" add constraint "menu_category_pkey" PRIMARY KEY using index "menu_category_pkey";

alter table "public"."order_items" add constraint "order_item_pkey" PRIMARY KEY using index "order_item_pkey";

alter table "public"."orders" add constraint "order_pkey" PRIMARY KEY using index "order_pkey";

alter table "public"."restaurant" add constraint "restaurant_pkey" PRIMARY KEY using index "restaurant_pkey";

alter table "public"."items" add constraint "menu_item_menu_category_id_fkey" FOREIGN KEY (menu_category_id) REFERENCES menu_category(id) ON DELETE RESTRICT not valid;

alter table "public"."items" validate constraint "menu_item_menu_category_id_fkey";

alter table "public"."items" add constraint "menu_item_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) ON DELETE CASCADE not valid;

alter table "public"."items" validate constraint "menu_item_restaurant_id_fkey";

alter table "public"."order_items" add constraint "order_item_menu_item_id_fkey" FOREIGN KEY (menu_item_id) REFERENCES items(id) ON DELETE RESTRICT not valid;

alter table "public"."order_items" validate constraint "order_item_menu_item_id_fkey";

alter table "public"."order_items" add constraint "order_item_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT not valid;

alter table "public"."order_items" validate constraint "order_item_order_id_fkey";

alter table "public"."orders" add constraint "order_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT not valid;

alter table "public"."orders" validate constraint "order_user_id_fkey";

alter table "public"."orders" add constraint "orders_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) ON DELETE RESTRICT not valid;

alter table "public"."orders" validate constraint "orders_restaurant_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.place_order(user_id uuid, order_data jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$DECLARE order_id UUID := gen_random_uuid();
item JSONB;
total_price NUMERIC := 0;
delivery_fee NUMERIC;
service_charge NUMERIC;
total NUMERIC;
BEGIN -- Calculate total price
SELECT SUM(
        COALESCE(
            (order_item->>'discount_price')::NUMERIC,
            (order_item->>'price')::NUMERIC
        ) * (order_item->>'quantity')::NUMERIC
    ) INTO total_price
FROM jsonb_array_elements(order_data->'items') AS order_item;
-- Fetch latest non-null delivery_fee
SELECT s.delivery_fee INTO delivery_fee
FROM internal_settings s
WHERE s.delivery_fee IS NOT NULL
ORDER BY s.created_at DESC
LIMIT 1;
-- Fetch latest non-null service_charge
SELECT s.service_charge INTO service_charge
FROM internal_settings s
WHERE s.service_charge IS NOT NULL
ORDER BY s.created_at DESC
LIMIT 1;
-- Calculate total
total := total_price + delivery_fee + service_charge;
-- Insert the main order
INSERT INTO orders (
        id,
        user_id,
        restaurant_id,
        name,
        address,
        phone,
        whatsapp,
        special_instructions,
        total_price,
        delivery_fee,
        service_charge,
        total,
        created_at
    )
VALUES (
        order_id,
        user_id,
        (order_data->>'restaurantId')::UUID,
        order_data->>'name',
        order_data->>'address',
        order_data->>'phone',
        order_data->>'whatsapp',
        order_data->>'specialInstructions',
        total_price,
        delivery_fee,
        service_charge,
        total,
        NOW()
    );
-- Loop through items and insert them
FOR item IN
SELECT *
FROM jsonb_array_elements(order_data->'items') LOOP
INSERT INTO order_items (
        id,
        order_id,
        menu_item_id,
        price,
        quantity
    )
VALUES (
        gen_random_uuid(),
        order_id,
        (item->>'id')::UUID,
        (item->>'price')::NUMERIC,
        (item->>'quantity')::INT
    );
END LOOP;
RETURN order_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ BEGIN NEW.updated_at = current_timestamp;
RETURN NEW;
END;
$function$
;

grant delete on table "public"."internal_settings" to "anon";

grant insert on table "public"."internal_settings" to "anon";

grant references on table "public"."internal_settings" to "anon";

grant select on table "public"."internal_settings" to "anon";

grant trigger on table "public"."internal_settings" to "anon";

grant truncate on table "public"."internal_settings" to "anon";

grant update on table "public"."internal_settings" to "anon";

grant delete on table "public"."internal_settings" to "authenticated";

grant insert on table "public"."internal_settings" to "authenticated";

grant references on table "public"."internal_settings" to "authenticated";

grant select on table "public"."internal_settings" to "authenticated";

grant trigger on table "public"."internal_settings" to "authenticated";

grant truncate on table "public"."internal_settings" to "authenticated";

grant update on table "public"."internal_settings" to "authenticated";

grant delete on table "public"."internal_settings" to "service_role";

grant insert on table "public"."internal_settings" to "service_role";

grant references on table "public"."internal_settings" to "service_role";

grant select on table "public"."internal_settings" to "service_role";

grant trigger on table "public"."internal_settings" to "service_role";

grant truncate on table "public"."internal_settings" to "service_role";

grant update on table "public"."internal_settings" to "service_role";

grant delete on table "public"."items" to "anon";

grant insert on table "public"."items" to "anon";

grant references on table "public"."items" to "anon";

grant select on table "public"."items" to "anon";

grant trigger on table "public"."items" to "anon";

grant truncate on table "public"."items" to "anon";

grant update on table "public"."items" to "anon";

grant delete on table "public"."items" to "authenticated";

grant insert on table "public"."items" to "authenticated";

grant references on table "public"."items" to "authenticated";

grant select on table "public"."items" to "authenticated";

grant trigger on table "public"."items" to "authenticated";

grant truncate on table "public"."items" to "authenticated";

grant update on table "public"."items" to "authenticated";

grant delete on table "public"."items" to "service_role";

grant insert on table "public"."items" to "service_role";

grant references on table "public"."items" to "service_role";

grant select on table "public"."items" to "service_role";

grant trigger on table "public"."items" to "service_role";

grant truncate on table "public"."items" to "service_role";

grant update on table "public"."items" to "service_role";

grant delete on table "public"."menu_category" to "anon";

grant insert on table "public"."menu_category" to "anon";

grant references on table "public"."menu_category" to "anon";

grant select on table "public"."menu_category" to "anon";

grant trigger on table "public"."menu_category" to "anon";

grant truncate on table "public"."menu_category" to "anon";

grant update on table "public"."menu_category" to "anon";

grant delete on table "public"."menu_category" to "authenticated";

grant insert on table "public"."menu_category" to "authenticated";

grant references on table "public"."menu_category" to "authenticated";

grant select on table "public"."menu_category" to "authenticated";

grant trigger on table "public"."menu_category" to "authenticated";

grant truncate on table "public"."menu_category" to "authenticated";

grant update on table "public"."menu_category" to "authenticated";

grant delete on table "public"."menu_category" to "service_role";

grant insert on table "public"."menu_category" to "service_role";

grant references on table "public"."menu_category" to "service_role";

grant select on table "public"."menu_category" to "service_role";

grant trigger on table "public"."menu_category" to "service_role";

grant truncate on table "public"."menu_category" to "service_role";

grant update on table "public"."menu_category" to "service_role";

grant delete on table "public"."order_items" to "anon";

grant insert on table "public"."order_items" to "anon";

grant references on table "public"."order_items" to "anon";

grant select on table "public"."order_items" to "anon";

grant trigger on table "public"."order_items" to "anon";

grant truncate on table "public"."order_items" to "anon";

grant update on table "public"."order_items" to "anon";

grant delete on table "public"."order_items" to "authenticated";

grant insert on table "public"."order_items" to "authenticated";

grant references on table "public"."order_items" to "authenticated";

grant select on table "public"."order_items" to "authenticated";

grant trigger on table "public"."order_items" to "authenticated";

grant truncate on table "public"."order_items" to "authenticated";

grant update on table "public"."order_items" to "authenticated";

grant delete on table "public"."order_items" to "service_role";

grant insert on table "public"."order_items" to "service_role";

grant references on table "public"."order_items" to "service_role";

grant select on table "public"."order_items" to "service_role";

grant trigger on table "public"."order_items" to "service_role";

grant truncate on table "public"."order_items" to "service_role";

grant update on table "public"."order_items" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."restaurant" to "anon";

grant insert on table "public"."restaurant" to "anon";

grant references on table "public"."restaurant" to "anon";

grant select on table "public"."restaurant" to "anon";

grant trigger on table "public"."restaurant" to "anon";

grant truncate on table "public"."restaurant" to "anon";

grant update on table "public"."restaurant" to "anon";

grant delete on table "public"."restaurant" to "authenticated";

grant insert on table "public"."restaurant" to "authenticated";

grant references on table "public"."restaurant" to "authenticated";

grant select on table "public"."restaurant" to "authenticated";

grant trigger on table "public"."restaurant" to "authenticated";

grant truncate on table "public"."restaurant" to "authenticated";

grant update on table "public"."restaurant" to "authenticated";

grant delete on table "public"."restaurant" to "service_role";

grant insert on table "public"."restaurant" to "service_role";

grant references on table "public"."restaurant" to "service_role";

grant select on table "public"."restaurant" to "service_role";

grant trigger on table "public"."restaurant" to "service_role";

grant truncate on table "public"."restaurant" to "service_role";

grant update on table "public"."restaurant" to "service_role";

create policy "Allow everyone read internal_settings"
on "public"."internal_settings"
as permissive
for select
to public
using (true);


create policy "Authenticated users can delete their own menu items"
on "public"."items"
as permissive
for delete
to authenticated
using (true);


create policy "Authenticated users can insert menu items"
on "public"."items"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can update their own menu items"
on "public"."items"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Public can select menu items"
on "public"."items"
as permissive
for select
to authenticated, anon
using (true);


create policy "Authenticated users can delete their own menu categories"
on "public"."menu_category"
as permissive
for delete
to authenticated
using (true);


create policy "Authenticated users can insert menu categories"
on "public"."menu_category"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can update their own menu categories"
on "public"."menu_category"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Public can select menu categories"
on "public"."menu_category"
as permissive
for select
to authenticated, anon
using (true);


create policy "Users can insert order items"
on "public"."order_items"
as permissive
for insert
to authenticated
with check ((order_id IN ( SELECT orders.id
   FROM orders
  WHERE (orders.user_id = ( SELECT auth.uid() AS uid)))));


create policy "Users can update their order items"
on "public"."order_items"
as permissive
for update
to authenticated
using ((order_id IN ( SELECT orders.id
   FROM orders
  WHERE (orders.user_id = ( SELECT auth.uid() AS uid)))));


create policy "Users can view their order items"
on "public"."order_items"
as permissive
for select
to authenticated
using ((order_id IN ( SELECT orders.id
   FROM orders
  WHERE (orders.user_id = ( SELECT auth.uid() AS uid)))));


create policy "Authenticated users can insert orders"
on "public"."orders"
as permissive
for insert
to authenticated
with check (true);


create policy "Users can update their own orders"
on "public"."orders"
as permissive
for update
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Users can view their orders"
on "public"."orders"
as permissive
for select
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Authenticated users can delete their own restaurants"
on "public"."restaurant"
as permissive
for delete
to authenticated
using (true);


create policy "Authenticated users can insert restaurants"
on "public"."restaurant"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can update their own restaurants"
on "public"."restaurant"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Public can select restaurants"
on "public"."restaurant"
as permissive
for select
to authenticated, anon
using (true);


CREATE TRIGGER update_menu_item_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_category_updated_at BEFORE UPDATE ON public.menu_category FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_updated_at BEFORE UPDATE ON public.restaurant FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


