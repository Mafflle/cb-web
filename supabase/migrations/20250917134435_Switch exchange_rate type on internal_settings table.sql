ALTER TABLE internal_settings
  ALTER COLUMN exchange_rate TYPE NUMERIC USING exchange_rate::NUMERIC;