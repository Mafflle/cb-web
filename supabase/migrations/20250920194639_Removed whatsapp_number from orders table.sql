ALTER TABLE orders
    DROP COLUMN whatsapp,
    ALTER COLUMN special_instructions DROP NOT NULL;