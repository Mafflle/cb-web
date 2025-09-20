ALTER TABLE internal_settings
    ALTER COLUMN exchange_rate SET NOT NULL,
    ALTER COLUMN service_charge SET NOT NULL,
    ALTER COLUMN delivery_fee SET NOT NULL;