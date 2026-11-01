-- ==============================================================================
-- Shoe Shop / StepStyle - Complete Supabase PostgreSQL Schema & Migration
-- ==============================================================================
-- Safe for execution directly in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
--
-- Justification for additions beyond original supabase_migration.sql:
-- 1. `users`: Required for Spring Security role-based admin authentication (BCrypt hashed).
--    Never store plaintext credentials. Allows admin login without hardcoding passwords in code.
-- 2. `orders` & `order_items`: Required for the Admin Orders management page (/orders)
--    and the customer store checkout workflow.
-- 3. `refresh_tokens` & `password_reset_tokens`: Required for JWT refresh and password recovery.
-- ==============================================================================

-- 1. Helper Function for automated updated_at timestamp maintenance
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. Users Table (Admin & Customers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE OR REPLACE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 3. Categories Table (Exact match to existing schema)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_name_lower ON categories (LOWER(name));
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_slug_lower ON categories (LOWER(slug));
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories (active);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories (display_order);

CREATE OR REPLACE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 4. Products Table (Exact match to existing schema with SKU & all fields)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(50),
    brand VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    available_sizes VARCHAR(255) NOT NULL,
    available_colors VARCHAR(255) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    discount_percentage INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 4.5,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Idempotent column check for sku
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sku'
    ) THEN
        ALTER TABLE products ADD COLUMN sku VARCHAR(50);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_sku ON products (sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (LOWER(category));
CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products (stock_quantity);

CREATE OR REPLACE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 5. Product Images Table (Multi-image support with CASCADE deletion)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON product_images (display_order);

-- ==============================================================================
-- 6. Orders Table (Enables Admin Orders Dashboard & Customer Checkout)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'COD',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

CREATE OR REPLACE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 7. Order Items Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    product_brand VARCHAR(100) NOT NULL,
    product_image_url VARCHAR(500),
    size VARCHAR(20) NOT NULL,
    color VARCHAR(30) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id);

-- ==============================================================================
-- 8. Refresh Tokens & Password Reset Tokens
-- ==============================================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==============================================================================
-- 9. Seed Default Categories (Non-destructive)
-- ==============================================================================
INSERT INTO categories (name, slug, description, image_url, display_order, active)
VALUES
('Men''s Shoes', 'men', 'Athletic runners, formal oxfords, and versatile loafers', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80', 1, TRUE),
('Women''s Shoes', 'women', 'Graceful heels, cushioned flats, running trainers, and everyday comfort', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80', 2, TRUE),
('Kids'' Shoes', 'kids', 'Playproof sneakers, school shoes, and soft flexible sandals', 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80', 3, TRUE),
('Sports Shoes', 'sports', 'High-performance marathon, gym trainers, and court shoes', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80', 4, TRUE),
('Casual Shoes', 'casual', 'Trendsetting street sneakers, boat shoes, and relaxed loafers', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80', 5, TRUE),
('Formal Shoes', 'formal', 'Handcrafted genuine leather oxfords, derbies, and executive slip-ons', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80', 6, TRUE),
('Sneakers', 'sneakers', 'Modern street style sneakers and daily lifestyle footwear', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80', 7, TRUE),
('Sandals', 'sandals', 'Comfortable strap sandals and airy outdoor footwear', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80', 8, TRUE),
('Slippers', 'slippers', 'Orthopedic memory foam slippers and indoor slide comforts', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80', 9, TRUE),
('Chappals', 'chappals', 'Authentic South Indian handcrafted leather chappals and daily comforts', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80', 10, TRUE),
('Flip-Flops', 'flip-flops', 'Waterproof lightweight daily slides and beach wear', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80', 11, TRUE),
('Other Footwear', 'other', 'Specialty and multi-purpose footwear accessories', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80', 12, TRUE)
ON CONFLICT DO NOTHING;

-- Advance Sequence Values
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1));
SELECT setval(pg_get_serial_sequence('product_images', 'id'), COALESCE((SELECT MAX(id) FROM product_images), 1));

-- ==============================================================================
-- 10. Supabase Storage Bucket & Storage Security Policies
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Public read access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Read Access for Product Images'
    ) THEN
        CREATE POLICY "Public Read Access for Product Images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'product-images');
    END IF;
END $$;

-- Policy 2: Service role / Backend upload access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Service Role Upload Access for Product Images'
    ) THEN
        CREATE POLICY "Service Role Upload Access for Product Images"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'product-images');
    END IF;
END $$;

-- Policy 3: Service role / Backend update access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Service Role Update Access for Product Images'
    ) THEN
        CREATE POLICY "Service Role Update Access for Product Images"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'product-images');
    END IF;
END $$;

-- Policy 4: Service role / Backend delete access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Service Role Delete Access for Product Images'
    ) THEN
        CREATE POLICY "Service Role Delete Access for Product Images"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'product-images');
    END IF;
END $$;
