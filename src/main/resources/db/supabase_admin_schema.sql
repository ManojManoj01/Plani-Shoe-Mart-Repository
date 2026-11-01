-- ==============================================================================
-- Shoe & Chappal Store Admin Backend - Supabase PostgreSQL Schema Script
-- ==============================================================================
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Helper Function for automated updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. Admins Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL DEFAULT 'Admin',
    last_name VARCHAR(50) NOT NULL DEFAULT 'User',
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_ADMIN',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins (username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email);

CREATE OR REPLACE TRIGGER trg_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Compatible users table for Spring Security UserDetailsService
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL DEFAULT 'Admin',
    last_name VARCHAR(50) NOT NULL DEFAULT 'User',
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_ADMIN',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE OR REPLACE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 3. Categories Table (Shoes, Chappals, Slippers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_active ON categories (active);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories (display_order);

CREATE OR REPLACE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 4. Products Table
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

CREATE INDEX IF NOT EXISTS idx_products_category ON products (LOWER(category));
CREATE INDEX IF NOT EXISTS idx_products_active ON products (active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products (stock_quantity);

CREATE OR REPLACE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Multi-image support table
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ==============================================================================
-- 5. Seed the Exactly Three Categories
-- ==============================================================================
INSERT INTO categories (name, slug, description, image_url, display_order, active)
VALUES
('Shoes', 'shoes', 'Athletic, sports, formal, sneakers, and casual footwear for daily life and performance', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', 1, TRUE),
('Chappals', 'chappals', 'Authentic traditional handcrafted leather chappals and daily ethnic wear', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80', 2, TRUE),
('Slippers', 'slippers', 'Comfortable indoor slides, flip-flops, and ergonomic soft memory-foam footwear', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80', 3, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- 6. Seed Admin Account Placeholder (BCrypt hashed for password 'Admin@123')
-- ==============================================================================
-- Password: Admin@123
-- BCrypt: $2a$10$wN1kFom4sZzF1wB4zI0VauBfV8yJgL5kQk/Z8i.v81P8fE0o01nxe
INSERT INTO admins (username, email, password_hash, first_name, last_name, role, active)
VALUES
('admin', 'admin@shoeshop.com', '$2a$10$wN1kFom4sZzF1wB4zI0VauBfV8yJgL5kQk/Z8i.v81P8fE0o01nxe', 'Admin', 'User', 'ROLE_ADMIN', TRUE)
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, password_hash, first_name, last_name, role, active)
VALUES
('admin', 'admin@shoeshop.com', '$2a$10$wN1kFom4sZzF1wB4zI0VauBfV8yJgL5kQk/Z8i.v81P8fE0o01nxe', 'Admin', 'User', 'ROLE_ADMIN', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Seed Sample Products in each of the three categories
INSERT INTO products (name, sku, brand, description, price, original_price, category, available_sizes, available_colors, stock_quantity, image_url, discount_percentage, rating, active)
VALUES
('Air Max Pegasus Running Shoes', 'SHOE-001', 'Nike', 'Premium cushioned lightweight road running shoes engineered for peak speed and endurance.', 6999.00, 8999.00, 'Shoes', '7,8,9,10,11', 'Black,White,Red', 25, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', 22, 4.8, TRUE),
('Classic Handcrafted Kolhapuri Chappals', 'CHAP-001', 'StepStyle Heritage', 'Genuine vegetable-tanned leather handcrafted traditional chappals with intricate braided design.', 1499.00, 1999.00, 'Chappals', '6,7,8,9,10', 'Tan Brown,Dark Brown', 40, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80', 25, 4.7, TRUE),
('CloudComfort Memory Foam Slippers', 'SLIP-001', 'StepStyle Daily', 'Ultra-soft indoor and outdoor ergonomic slide slippers with anti-slip grooved rubber outsole.', 799.00, 1299.00, 'Slippers', '6,7,8,9,10,11', 'Navy,Grey,Black', 8, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80', 38, 4.6, TRUE)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 7. Supabase Storage Bucket & Policies for Product Images
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

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
