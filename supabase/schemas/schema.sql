SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
COMMENT ON SCHEMA "public" IS 'standard public schema';
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE TYPE "public"."order_status" AS ENUM (
    'pending_confirmation',
    'confirmed',
    'in_preparation',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'failed',
    'refunded'
);
ALTER TYPE "public"."order_status" OWNER TO "postgres";
CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);
ALTER TYPE "public"."payment_status" OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."place_order"("user_id" "uuid", "order_data" "jsonb") RETURNS "uuid" LANGUAGE "plpgsql" AS $$DECLARE order_id UUID := gen_random_uuid();
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
$$;
ALTER FUNCTION "public"."place_order"("user_id" "uuid", "order_data" "jsonb") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger" LANGUAGE "plpgsql" AS $$ BEGIN NEW.updated_at = current_timestamp;
RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";
SET default_tablespace = '';
SET default_table_access_method = "heap";
CREATE TABLE IF NOT EXISTS "public"."internal_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "delivery_fee" numeric,
    "service_charge" numeric,
    "exchange_rate" bigint
);
ALTER TABLE "public"."internal_settings" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10, 2),
    "discount_price" numeric(10, 2),
    "image" "text" NOT NULL,
    "menu_category_id" "uuid",
    "restaurant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "public"."items" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."menu_category" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "cover_image" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "public"."menu_category" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "menu_item_id" "uuid" NOT NULL,
    "quantity" smallint NOT NULL,
    "price" numeric NOT NULL
);
ALTER TABLE "public"."order_items" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "address" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "whatsapp" "text" NOT NULL,
    "special_instructions" "text" NOT NULL,
    "payment_status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status" NOT NULL,
    "order_status" "public"."order_status" DEFAULT 'pending_confirmation'::"public"."order_status" NOT NULL,
    "restaurant_id" "uuid" NOT NULL,
    "total_price" numeric NOT NULL,
    "delivery_fee" numeric NOT NULL,
    "service_charge" numeric NOT NULL,
    "total" numeric DEFAULT '10000'::numeric NOT NULL
);
ALTER TABLE ONLY "public"."orders" REPLICA IDENTITY FULL;
ALTER TABLE "public"."orders" OWNER TO "postgres";
COMMENT ON COLUMN "public"."orders"."total" IS 'Total money to be paid, the sum of total_price, delivery_fee and service_charge';
CREATE TABLE IF NOT EXISTS "public"."restaurant" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "whatsapp" "text" NOT NULL,
    "phone_no" "text" NOT NULL,
    "address" "text" NOT NULL,
    "logo" "text" NOT NULL,
    "cover_image" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "is_active" boolean DEFAULT false NOT NULL,
    "slug" "text" DEFAULT 'test'::"text" NOT NULL
);
ALTER TABLE "public"."restaurant" OWNER TO "postgres";
ALTER TABLE ONLY "public"."internal_settings"
ADD CONSTRAINT "internal_settings_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."menu_category"
ADD CONSTRAINT "menu_category_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."items"
ADD CONSTRAINT "menu_item_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."order_items"
ADD CONSTRAINT "order_item_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."orders"
ADD CONSTRAINT "order_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."restaurant"
ADD CONSTRAINT "restaurant_pkey" PRIMARY KEY ("id");
CREATE INDEX "idx_menu_item_category_id" ON "public"."items" USING "btree" ("menu_category_id");
CREATE INDEX "idx_menu_item_restaurant_id" ON "public"."items" USING "btree" ("restaurant_id");
CREATE INDEX "idx_orders_user_id" ON "public"."orders" USING "btree" ("user_id");
CREATE OR REPLACE TRIGGER "update_menu_category_updated_at" BEFORE
UPDATE ON "public"."menu_category" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "update_menu_item_updated_at" BEFORE
UPDATE ON "public"."items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "update_restaurant_updated_at" BEFORE
UPDATE ON "public"."restaurant" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
ALTER TABLE ONLY "public"."items"
ADD CONSTRAINT "menu_item_menu_category_id_fkey" FOREIGN KEY ("menu_category_id") REFERENCES "public"."menu_category"("id") ON DELETE RESTRICT;
ALTER TABLE ONLY "public"."items"
ADD CONSTRAINT "menu_item_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."order_items"
ADD CONSTRAINT "order_item_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "public"."items"("id") ON DELETE RESTRICT;
ALTER TABLE ONLY "public"."order_items"
ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT;
ALTER TABLE ONLY "public"."orders"
ADD CONSTRAINT "order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;
ALTER TABLE ONLY "public"."orders"
ADD CONSTRAINT "orders_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE RESTRICT;
CREATE POLICY "Allow everyone read internal_settings" ON "public"."internal_settings" FOR
SELECT USING (true);
CREATE POLICY "Authenticated users can delete their own menu categories" ON "public"."menu_category" FOR DELETE TO "authenticated" USING (true);
CREATE POLICY "Authenticated users can delete their own menu items" ON "public"."items" FOR DELETE TO "authenticated" USING (true);
CREATE POLICY "Authenticated users can delete their own restaurants" ON "public"."restaurant" FOR DELETE TO "authenticated" USING (true);
CREATE POLICY "Authenticated users can insert menu categories" ON "public"."menu_category" FOR
INSERT TO "authenticated" WITH CHECK (true);
CREATE POLICY "Authenticated users can insert menu items" ON "public"."items" FOR
INSERT TO "authenticated" WITH CHECK (true);
CREATE POLICY "Authenticated users can insert orders" ON "public"."orders" FOR
INSERT TO "authenticated" WITH CHECK (true);
CREATE POLICY "Authenticated users can insert restaurants" ON "public"."restaurant" FOR
INSERT TO "authenticated" WITH CHECK (true);
CREATE POLICY "Authenticated users can update their own menu categories" ON "public"."menu_category" FOR
UPDATE TO "authenticated" USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can update their own menu items" ON "public"."items" FOR
UPDATE TO "authenticated" USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can update their own restaurants" ON "public"."restaurant" FOR
UPDATE TO "authenticated" USING (true) WITH CHECK (true);
CREATE POLICY "Public can select menu categories" ON "public"."menu_category" FOR
SELECT TO "authenticated",
    "anon" USING (true);
CREATE POLICY "Public can select menu items" ON "public"."items" FOR
SELECT TO "authenticated",
    "anon" USING (true);
CREATE POLICY "Public can select restaurants" ON "public"."restaurant" FOR
SELECT TO "authenticated",
    "anon" USING (true);
CREATE POLICY "Users can insert order items" ON "public"."order_items" FOR
INSERT TO "authenticated" WITH CHECK (
        (
            "order_id" IN (
                SELECT "orders"."id"
                FROM "public"."orders"
                WHERE (
                        "orders"."user_id" = (
                            SELECT "auth"."uid"() AS "uid"
                        )
                    )
            )
        )
    );
CREATE POLICY "Users can update their order items" ON "public"."order_items" FOR
UPDATE TO "authenticated" USING (
        (
            "order_id" IN (
                SELECT "orders"."id"
                FROM "public"."orders"
                WHERE (
                        "orders"."user_id" = (
                            SELECT "auth"."uid"() AS "uid"
                        )
                    )
            )
        )
    );
CREATE POLICY "Users can update their own orders" ON "public"."orders" FOR
UPDATE TO "authenticated" USING (
        (
            "user_id" = (
                SELECT "auth"."uid"() AS "uid"
            )
        )
    );
CREATE POLICY "Users can view their order items" ON "public"."order_items" FOR
SELECT TO "authenticated" USING (
        (
            "order_id" IN (
                SELECT "orders"."id"
                FROM "public"."orders"
                WHERE (
                        "orders"."user_id" = (
                            SELECT "auth"."uid"() AS "uid"
                        )
                    )
            )
        )
    );
CREATE POLICY "Users can view their orders" ON "public"."orders" FOR
SELECT TO "authenticated" USING (
        (
            "user_id" = (
                SELECT "auth"."uid"() AS "uid"
            )
        )
    );
ALTER TABLE "public"."internal_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."menu_category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."restaurant" ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";
ALTER PUBLICATION "supabase_realtime"
ADD TABLE ONLY "public"."orders";
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT ALL ON FUNCTION "public"."place_order"("user_id" "uuid", "order_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."place_order"("user_id" "uuid", "order_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."place_order"("user_id" "uuid", "order_data" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
GRANT ALL ON TABLE "public"."internal_settings" TO "anon";
GRANT ALL ON TABLE "public"."internal_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."internal_settings" TO "service_role";
GRANT ALL ON TABLE "public"."items" TO "anon";
GRANT ALL ON TABLE "public"."items" TO "authenticated";
GRANT ALL ON TABLE "public"."items" TO "service_role";
GRANT ALL ON TABLE "public"."menu_category" TO "anon";
GRANT ALL ON TABLE "public"."menu_category" TO "authenticated";
GRANT ALL ON TABLE "public"."menu_category" TO "service_role";
GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";
GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";
GRANT ALL ON TABLE "public"."restaurant" TO "anon";
GRANT ALL ON TABLE "public"."restaurant" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurant" TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "service_role";
RESET ALL;