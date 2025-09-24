ALTER TABLE restaurant
DROP COLUMN preparation_time;

ALTER TABLE restaurant
ADD COLUMN preparation_time INTEGER NOT NULL;