set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.place_order(user_id uuid, order_data jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$DECLARE
  order_id UUID := gen_random_uuid();
  item JSONB;
  total_price NUMERIC := 0;
  delivery_fee NUMERIC;
  service_charge NUMERIC;
  total NUMERIC;
BEGIN
  -- Calculate total price
  SELECT SUM(
    COALESCE((order_item ->> 'discount_price')::NUMERIC, (order_item ->> 'price')::NUMERIC) 
    * (order_item ->> 'quantity')::NUMERIC
  )
  INTO total_price
  FROM jsonb_array_elements(order_data -> 'items') AS order_item;
  
  -- Fetch latest non-null delivery_fee
  SELECT s.delivery_fee
  INTO delivery_fee
  FROM internal_settings s
  WHERE s.delivery_fee IS NOT NULL
  ORDER BY s.created_at DESC
  LIMIT 1;

  -- Fetch latest non-null service_charge
  SELECT s.service_charge
  INTO service_charge
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
    (order_data ->> 'restaurantId')::UUID,
    order_data ->> 'name',
    order_data ->> 'address',
    order_data ->> 'phone',
    order_data ->> 'whatsapp',
    order_data ->> 'specialInstructions',
    total_price,
    delivery_fee,
    service_charge,
    total,
    NOW()
  );

  -- Loop through items and insert them
  FOR item IN SELECT * FROM jsonb_array_elements(order_data -> 'items')
  LOOP
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
      (item ->> 'id')::UUID,
      (item ->> 'price')::NUMERIC,
      (item ->> 'quantity')::INT
    );
  END LOOP;

  RETURN order_id;
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = current_timestamp;
    RETURN NEW;
END;
$function$
;


