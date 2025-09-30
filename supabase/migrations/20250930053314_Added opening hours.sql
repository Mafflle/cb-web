ALTER TABLE restaurant
ADD COLUMN opening_hours JSONB NOT NULL DEFAULT '{
  "monday": {"open": "09:00", "close": "17:00"},
  "tuesday": {"open": "09:00", "close": "17:00"},
  "wednesday": {"open": "09:00", "close": "17:00"},
  "thursday": {"open": "09:00", "close": "17:00"},
  "friday": {"open": "09:00", "close": "17:00"},
  "saturday": {"open": null, "close": null},
  "sunday": {"open": null, "close": null}
}'::jsonb;