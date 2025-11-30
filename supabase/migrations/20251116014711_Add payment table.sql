-- Remove Payment Reference column from Orders table
ALTER TABLE orders
DROP COLUMN payment_reference;

-- Create New Payments table
DROP TABLE IF EXISTS payments;
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency VARCHAR(10) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert payments for their own orders
CREATE POLICY "Authenticated users can insert payments"
ON "public"."payments"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
    )
);

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
ON "public"."payments"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
    )
);

-- Users can update their own payments (for status updates, etc.)
CREATE POLICY "Users can update their own payments"
ON "public"."payments"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
    )
);