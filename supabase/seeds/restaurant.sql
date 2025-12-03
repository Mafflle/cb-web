INSERT INTO restaurant (name, description, phone_no, address, logo, cover_image, is_active, is_featured, slug, start_price, preparation_time)
VALUES
-- Nigerian / Beninese restaurants
('Suya Spot', 'Grilled suya and other spicy delights from Nigeria.', '+22911223344', '789 Grill Rd, Food City', '/images/restaurant-3.png', '/images/suya-spot-cover.png', true, false, 'suya-spot', 2200, 40),
('Jollof Junction', 'Specializing in Jollof rice and other West African favorites.', '+22987654321', '456 Rice Ave, Food City', '/images/restaurant-2.png', '/images/jollof-junction-cover.png', true, false, 'jollof-junction', 1800, 35),
('Yotomi Foods', 'A cozy spot for traditional Nigerian dishes.', '+22955667788', '654 Curry Ln, Food City', '/images/restaurant-5.png', '/images/yotomi-cover.png', true, true, 'yotomi', 1500, 30),
('Taste of Nigeria', 'Authentic Nigerian cuisine with a variety of traditional dishes.', '+22912345678', '123 Food St, Food City', '/images/restaurant-1.webp', '/images/taste-of-nigeria-cover.png', true, true, 'taste-of-nigeria', 2000, 45),
('Forks & Swallow', 'A fusion of Nigerian and international flavors.', '+22944332211', '321 Fusion Blvd, Food City', '/images/restaurant-4.png', '/images/forks-and-swallow-cover.png', true, false, 'forks-and-swallow', 2500, 50),
('Vegan Vibes', 'Plant-based meals that are both healthy and delicious.', '+22999887766', '987 Vegan St, Food City', '/images/restaurant-6.png', '/images/vegan-vibes-cover.png', true, true, 'vegan-vibes', 1700, 25);

-- Add foods to the restaurants by looping through restaurant IDs
DO $$
DECLARE
    vendor RECORD;
BEGIN
    FOR vendor IN SELECT * FROM restaurant LOOP
        INSERT INTO items (restaurant_id, name, description, price, discount_price, image, quantity)
        VALUES
        (vendor.id, 'Jollof Rice', 'Delicious Jollof rice with a choice of chicken or fish.', 3000, 2000, '/images/jollof-rice.jpg', 10),
        (vendor.id, 'Fried Rice and Turkey', 'Savory fried rice served with crispy fried turkey.', 3500, NULL, '/images/fried-rice-and-turkey.jpg', 15),
        (vendor.id, 'Native Rice', 'Sweet native rice served with a choice of protein.', 1500, NULL, '/images/native-rice.jpg', 20);
    END LOOP;
END $$;