-- ==============================================================================
-- StepStyle / Show-Shop - MySQL 8.x Seed Data for Development
-- Includes Administrator, Sample User, Demo Retail Shop, and Full Catalog
-- ==============================================================================

USE show_shop_db;

-- 1. Development Users (Password: Password@123)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, active)
VALUES 
(1, 'admin', 'admin@stepstyle.com', '$2a$10$hKDVYxMxqG8M7XwH9C.C.e6OQ3x1JzB8Z4zGz2h6f4m9q3k2y1u9W', 'System', 'Administrator', 'ROLE_ADMIN', TRUE),
(2, 'john_doe', 'john.doe@example.com', '$2a$10$hKDVYxMxqG8M7XwH9C.C.e6OQ3x1JzB8Z4zGz2h6f4m9q3k2y1u9W', 'John', 'Doe', 'ROLE_USER', TRUE)
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- 2. Physical Shop Location
INSERT INTO shops (id, shop_name, address, city, state, postal_code, phone_number, opening_hours, latitude, longitude)
VALUES
(1, 'StepStyle Flagship Store', 'Plot 42, Sample Fashion Street, Sector 18', 'Metropolis', 'State', '110001', '+91 11 2345 6789', 'Mon - Sat: 10:00 AM - 09:30 PM, Sun: 11:00 AM - 08:00 PM', 28.6139391, 77.2090212)
ON DUPLICATE KEY UPDATE shop_name = VALUES(shop_name);

-- 3. Initial Shopping Carts for Seed Users
INSERT INTO carts (id, user_id)
VALUES
(1, 1),
(2, 2)
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

-- 4. Footwear Products across All Categories
INSERT INTO products (id, name, brand, description, price, original_price, category, available_sizes, available_colors, stock_quantity, image_url, discount_percentage, rating, active)
VALUES
-- Chappals
(1, 'Traditional Handcrafted Kolhapuri Chappals', 'StepStyle Heritage', 'Premium genuine leather handcrafted ethnic Kolhapuri chappals featuring braided straps, cushioned footbed, and durable leather sole. Perfect for festive and ethnic occasions.', 1299.00, 1899.00, 'Chappals', 'UK 6,UK 7,UK 8,UK 9,UK 10', 'Tan,Dark Brown,Natural', 45, 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80', 31, 4.7, TRUE),
(2, 'Daily Comfort Casual Chappals', 'SoleComfort', 'Ergonomically contoured rubberized EVA daily wear chappals with anti-skid bottom tread and waterproof strap. Ideal for home and casual outdoor errands.', 499.00, 799.00, 'Chappals', 'UK 7,UK 8,UK 9,UK 10,UK 11', 'Black,Navy Blue,Olive Green', 100, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80', 37, 4.4, TRUE),

-- Slippers
(3, 'Orthopedic Memory Foam House Slippers', 'OrthoStride', 'Plush, ultra-soft indoor slippers with high-density memory foam padding, arch support, and anti-slip rubberized traction outsole. Relieves heel and foot fatigue.', 799.00, 1199.00, 'Slippers', 'UK 6,UK 7,UK 8,UK 9,UK 10', 'Grey,Navy,Charcoal', 60, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80', 33, 4.8, TRUE),
(4, 'Quick-Dry Anti-Slip Bathroom Slippers', 'AquaStep', 'High-resilience EVA waterproof bathroom slippers featuring drain holes, non-slip textured sole, and lightweight ergonomic arch design.', 349.00, 499.00, 'Slippers', 'UK 5,UK 6,UK 7,UK 8,UK 9', 'Sky Blue,Slate Grey,Teal', 120, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80', 30, 4.3, TRUE),

-- Formal Shoes
(5, 'Classic Oxford Leather Brogues', 'RoyalStep', 'Hand-burnished Italian calfskin formal Oxford shoes with intricate brogue perforations, Goodyear-welted construction, and breathable leather lining.', 3499.00, 4999.00, 'Formal Shoes', 'UK 7,UK 8,UK 9,UK 10,UK 11', 'Cognac Brown,Jet Black', 30, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80', 30, 4.9, TRUE),
(6, 'Executive Slip-On Leather Loafers', 'Avenue Classic', 'Sleek, polished full-grain leather dress loafers with penny strap detail, flexible padded insole, and durable rubber heel for all-day office comfort.', 2799.00, 3999.00, 'Formal Shoes', 'UK 6,UK 7,UK 8,UK 9,UK 10', 'Black,Mahogany', 40, 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80', 30, 4.6, TRUE),

-- Sports Shoes
(7, 'AeroGlide Pro Marathon Running Shoes', 'Velocity Sport', 'High-performance lightweight mesh running shoes engineered with responsive nitrogen-infused foam midsole, carbon-fiber plate, and high-abrasion rubber outsole.', 3999.00, 5999.00, 'Sports Shoes', 'UK 7,UK 8,UK 9,UK 10,UK 11', 'Neon Lime,Cobalt Blue,Black White', 50, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', 33, 4.9, TRUE),
(8, 'CrossFit Flex Training Sneakers', 'Apex Athletics', 'Durable, breathable knit athletic trainers with lateral stability cage, flat stable lifting base, and shock-absorbing heel cushioning for gym and HIIT sessions.', 2499.00, 3499.00, 'Sports Shoes', 'UK 7,UK 8,UK 9,UK 10', 'All Black,White Grey,Crimson Red', 45, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80', 28, 4.7, TRUE),

-- Casual Shoes
(9, 'Urban Street Low-Top Canvas Sneakers', 'StreetVibe', 'Timeless vulcanized canvas lace-up sneakers featuring reinforced eyelets, padded collar, and durable waffle-grip rubber sole.', 1599.00, 2299.00, 'Casual Shoes', 'UK 6,UK 7,UK 8,UK 9,UK 10', 'Optic White,Midnight Black,Olive', 80, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80', 30, 4.5, TRUE),
(10, 'Suede Desert Chukka Boots', 'TimberTrail', 'Soft premium suede leather mid-top chukka boots with minimalist two-eyelet lacing, crepe rubber outsole, and moisture-wicking lining.', 2899.00, 4199.00, 'Casual Shoes', 'UK 7,UK 8,UK 9,UK 10,UK 11', 'Sand Khaki,Tobacco Brown,Charcoal', 35, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80', 31, 4.6, TRUE),

-- Men's Shoes
(11, 'Rugged Outdoor Hiking Trail Boots', 'PeakMaster', 'Waterproof leather and ripstop nylon trail boots with gusseted tongue, steel shank stability, and deep lug Vibram traction outsoles.', 4299.00, 5999.00, 'Men''s Shoes', 'UK 8,UK 9,UK 10,UK 11', 'Earth Brown,Moss Green', 25, 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80', 28, 4.8, TRUE),

-- Women's Shoes
(12, 'Elegance Block Heel Pointed Pumps', 'BellaModa', 'Chic pointed-toe formal pumps with a comfortable 2.5-inch sturdy block heel, cushioned footbed, and stain-resistant microfiber upper.', 2199.00, 3199.00, 'Women''s Shoes', 'UK 4,UK 5,UK 6,UK 7,UK 8', 'Nude Blush,Classic Black,Burgundy', 40, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80', 31, 4.7, TRUE),
(13, 'Casual Platform Knit Slip-On Flats', 'AuraWalk', 'Ultra-breathable engineered knit platform walking shoes with stretchy collar, memory foam insole, and featherlight EVA outsole.', 1499.00, 2099.00, 'Women''s Shoes', 'UK 4,UK 5,UK 6,UK 7,UK 8', 'Dusty Rose,Cloud White,Black', 65, 'https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=600&q=80', 28, 4.6, TRUE),

-- Kids' Shoes
(14, 'Kids Active Bounce Velcro Sneakers', 'TinyTreads', 'Fun, vibrant kids trainers with dual velcro strap closure, reinforced protective toe cap, breathable mesh upper, and non-marking light-up bounce sole.', 1199.00, 1699.00, 'Kids'' Shoes', 'UK 10 Kids,UK 11 Kids,UK 12 Kids,UK 1,UK 2', 'Royal Blue Red,Bubblegum Pink,Black Neon', 70, 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80', 29, 4.8, TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);
