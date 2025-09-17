-- Create database
CREATE DATABASE petal_place;

-- Use the database
\c petal_place;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_license VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    is_verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    images JSONB DEFAULT '[]',
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_intent_id VARCHAR(255),
    notes TEXT,
    tracking_number VARCHAR(100),
    estimated_delivery DATE,
    delivered_at TIMESTAMP,
    delivery_time_slot VARCHAR(50),
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_status VARCHAR(20) DEFAULT 'none' CHECK (refund_status IN ('none', 'requested', 'approved', 'processed', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cart_items table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Create order_tracking table
CREATE TABLE order_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}'
);

-- Create delivery_time_slots table
CREATE TABLE delivery_time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    max_orders INTEGER DEFAULT 10,
    current_orders INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, time_slot)
);

-- Create reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    images JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    admin_response TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_transactions table
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'reserved', 'released')),
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    reference_id UUID, -- order_id, adjustment_id, etc.
    reference_type VARCHAR(50), -- 'order', 'adjustment', 'return', etc.
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stock_alerts table
CREATE TABLE stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstock')),
    threshold_quantity INTEGER NOT NULL,
    current_quantity INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create search_history table
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    search_query VARCHAR(500) NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bouquets table
CREATE TABLE bouquets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    flowers JSONB NOT NULL,
    wrapping_type VARCHAR(50) DEFAULT 'paper',
    base_price DECIMAL(10,2) DEFAULT 15.00,
    total_price DECIMAL(10,2) NOT NULL,
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user locations table
CREATE TABLE user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(100),
    country VARCHAR(100),
    address TEXT,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create partners table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create promotions table
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    discount_percentage DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Insert sample data
INSERT INTO categories (name, name_ar, description) VALUES
('Natural Roses', 'الورد الطبيعي', 'Fresh natural roses in various colors'),
('Gift Boxes', 'بوكسات السعادة', 'Beautiful gift arrangements'),
('Wedding Services', 'كوش الأفراح', 'Wedding decorations and arrangements'),
('Bridal Bouquets', 'مسكات العروس', 'Special bridal bouquets'),
('Special Occasions', 'المناسبات', 'Flowers for special occasions'),
('Premium Flowers', 'الورود الفاخرة', 'High-quality premium flowers');

-- Insert sample admin user (password: 0000)
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified) VALUES
('admin@admin.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', true);

-- Insert sample user (password: 1111)
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified) VALUES
('user@user.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Regular', 'User', 'customer', true);

-- Insert sample vendor
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified) VALUES
('vendor@petalplace.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Vendor', 'User', 'vendor', true);

INSERT INTO vendors (user_id, business_name, business_license, address, city, is_verified) VALUES
((SELECT id FROM users WHERE email = 'vendor@petalplace.com'), 'Roses Garden', 'BL123456', '123 Flower Street', 'Riyadh', true);

-- Insert sample partners
INSERT INTO partners (name, name_ar, description, description_ar, logo_url, website_url, contact_email, contact_phone) VALUES
('Roses Garden', 'حديقة الورود', 'Premium flower supplier specializing in fresh roses and arrangements', 'مورد زهور متميز متخصص في الورود الطازجة والترتيبات', '/logos/roses-garden.png', 'https://www.instagram.com/rosesgarden90', 'info@rosesgarden.com', '+966501234567'),
('Flower Paradise', 'جنة الزهور', 'Leading provider of wedding and special occasion flowers', 'المزود الرائد لزهور الأعراس والمناسبات الخاصة', '/logos/flower-paradise.png', 'https://flowerparadise.com', 'contact@flowerparadise.com', '+966502345678'),
('Garden Fresh', 'الحديقة الطازجة', 'Fresh daily flower delivery service', 'خدمة توصيل الزهور الطازجة اليومية', '/logos/garden-fresh.png', 'https://gardenfresh.com', 'hello@gardenfresh.com', '+966503456789');

-- Insert sample products from Roses Garden Instagram
INSERT INTO products (vendor_id, category_id, name, name_ar, description, description_ar, price, original_price, stock_quantity, min_stock_level, images, features, is_active, is_featured) VALUES
-- Natural Roses Category
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Natural Roses'), 'Red Roses Bouquet', 'باقة الورود الحمراء', 'Fresh red roses arranged in a beautiful bouquet', 'ورود حمراء طازجة مرتبة في باقة جميلة', 45.00, 55.00, 25, 5, '["/images/red-roses-bouquet.jpg"]', '["Fresh", "Premium Quality", "Same Day Delivery"]', true, true),
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Natural Roses'), 'White Roses Arrangement', 'ترتيب الورود البيضاء', 'Elegant white roses in a sophisticated arrangement', 'ورود بيضاء أنيقة في ترتيب راقي', 50.00, 60.00, 20, 5, '["/images/white-roses-arrangement.jpg"]', '["Elegant", "Premium Quality", "Wedding Ready"]', true, true),
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Natural Roses'), 'Pink Roses Gift Box', 'صندوق هدايا الورود الوردية', 'Beautiful pink roses in an elegant gift box', 'ورود وردية جميلة في صندوق هدايا أنيق', 65.00, 75.00, 15, 5, '["/images/pink-roses-gift-box.jpg"]', '["Gift Ready", "Premium Packaging", "Romantic"]', true, false),

-- Gift Boxes Category
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Gift Boxes'), 'Happiness Gift Box', 'صندوق السعادة', 'Complete happiness package with flowers and chocolates', 'حزمة السعادة الكاملة مع الزهور والشوكولاتة', 85.00, 100.00, 30, 5, '["/images/happiness-gift-box.jpg"]', '["Complete Package", "Premium Gift", "Chocolates Included"]', true, true),
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Gift Boxes'), 'Love Surprise Box', 'صندوق مفاجأة الحب', 'Romantic surprise box with roses and treats', 'صندوق مفاجأة رومانسي مع الورود والحلويات', 95.00, 110.00, 20, 5, '["/images/love-surprise-box.jpg"]', '["Romantic", "Surprise Element", "Premium Treats"]', true, false),

-- Wedding Services Category
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Wedding Services'), 'Wedding Arch Decor', 'ديكور قوس الزفاف', 'Beautiful flower arch for wedding ceremonies', 'قوس زهور جميل لحفلات الزفاف', 200.00, 250.00, 8, 2, '["/images/wedding-arch-decor.jpg"]', '["Wedding Ready", "Custom Design", "Professional Setup"]', true, true),
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Wedding Services'), 'Bridal Table Centerpiece', 'زينة طاولة العروس', 'Elegant centerpiece for bridal tables', 'زينة أنيقة لطاولات العروس', 120.00, 150.00, 12, 3, '["/images/bridal-table-centerpiece.jpg"]', '["Elegant", "Wedding Theme", "Customizable"]', true, false),

-- Bridal Bouquets Category
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Bridal Bouquets'), 'Classic Bridal Bouquet', 'باقة العروس الكلاسيكية', 'Traditional white and cream bridal bouquet', 'باقة عروس تقليدية بيضاء وكريمية', 150.00, 180.00, 10, 2, '["/images/classic-bridal-bouquet.jpg"]', '["Classic Design", "Wedding Ready", "Premium Quality"]', true, true),
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Bridal Bouquets'), 'Modern Bridal Bouquet', 'باقة العروس العصرية', 'Contemporary bridal bouquet with mixed flowers', 'باقة عروس معاصرة مع زهور مختلطة', 180.00, 220.00, 8, 2, '["/images/modern-bridal-bouquet.jpg"]', '["Modern Design", "Mixed Flowers", "Unique Style"]', true, false),

-- Special Occasions Category
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Special Occasions'), 'Birthday Celebration', 'احتفال عيد الميلاد', 'Colorful birthday flower arrangement', 'ترتيب زهور ملون لعيد الميلاد', 75.00, 90.00, 25, 5, '["/images/birthday-celebration.jpg"]', '["Colorful", "Birthday Theme", "Celebration Ready"]', true, true),
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Special Occasions'), 'Anniversary Special', 'خاص بالذكرى السنوية', 'Romantic anniversary flower arrangement', 'ترتيب زهور رومانسي للذكرى السنوية', 90.00, 105.00, 18, 5, '["/images/anniversary-special.jpg"]', '["Romantic", "Anniversary Theme", "Special Occasion"]', true, false),

-- Premium Flowers Category
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Premium Flowers'), 'Luxury Rose Collection', 'مجموعة الورود الفاخرة', 'Premium collection of luxury roses', 'مجموعة متميزة من الورود الفاخرة', 120.00, 150.00, 12, 3, '["/images/luxury-rose-collection.jpg"]', '["Luxury", "Premium Quality", "Exclusive"]', true, true),
((SELECT id FROM vendors WHERE business_name = 'Roses Garden'), (SELECT id FROM categories WHERE name = 'Premium Flowers'), 'Exotic Flower Mix', 'مزيج الزهور الغريبة', 'Exotic and rare flower arrangement', 'ترتيب زهور غريبة ونادرة', 140.00, 170.00, 8, 2, '["/images/exotic-flower-mix.jpg"]', '["Exotic", "Rare Flowers", "Unique"]', true, false);
