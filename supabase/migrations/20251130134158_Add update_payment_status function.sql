CREATE OR REPLACE FUNCTION update_payment_status(
  p_order_id UUID,
  p_transaction_ref TEXT,
  p_status TEXT
) RETURNS void AS $$
BEGIN
  UPDATE payments SET payment_status = p_status::payment_status 
  WHERE order_id = p_order_id AND transaction_reference = p_transaction_ref;
  
  UPDATE orders SET payment_status = p_status::payment_status 
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;