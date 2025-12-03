ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Trigger to update the updated_at column on row modification
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments   
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
