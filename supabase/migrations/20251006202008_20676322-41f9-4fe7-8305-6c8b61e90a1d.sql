-- Step 1: Create proper role-based security system
CREATE TYPE public.app_role AS ENUM ('admin', 'florist', 'customer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Step 2: Drop old policies first, then remove role column
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

-- Now safe to drop the role column
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS role;

-- Create new policies using role system
CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage coupons"
ON public.coupons FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'florist'));

-- Step 3: Insert sample products with proper data (only if they don't exist)
INSERT INTO public.products (name, description, category, price, original_price, stock_quantity, images, occasions, colors, sizes, is_featured, is_new, care_instructions, sku)
SELECT * FROM (VALUES
-- Roses
('Classic Red Roses Bouquet', 'Elegant arrangement of 12 premium red roses with greenery', 'roses', 89.99, 109.99, 50, '["https://images.unsplash.com/photo-1518895949257-7621c3c786d7"]'::jsonb, '["romantic", "anniversary", "birthday"]'::jsonb, '["red"]'::jsonb, '["standard", "deluxe", "premium"]'::jsonb, true, false, 'Change water daily, trim stems at an angle, keep away from direct sunlight', 'RSE-001'),
('Pink Rose Elegance', 'Beautiful arrangement of 24 soft pink roses', 'roses', 129.99, 149.99, 35, '["https://images.unsplash.com/photo-1490750967868-88aa4486c946"]'::jsonb, '["birthday", "romantic", "thank-you"]'::jsonb, '["pink"]'::jsonb, '["standard", "deluxe"]'::jsonb, true, true, 'Change water every 2 days, keep in cool location', 'RSE-002'),
('White Rose Garden', 'Pure white roses symbolizing elegance and peace', 'roses', 99.99, 119.99, 40, '["https://images.unsplash.com/photo-1455659817273-f96807779a8a"]'::jsonb, '["wedding", "sympathy", "get-well"]'::jsonb, '["white"]'::jsonb, '["standard", "premium"]'::jsonb, false, false, 'Trim stems daily, change water frequently', 'RSE-003'),
('Rainbow Roses Collection', 'Vibrant mix of colorful roses in a stunning arrangement', 'roses', 149.99, 179.99, 25, '["https://images.unsplash.com/photo-1487070183336-b863922373d4"]'::jsonb, '["birthday", "celebration", "thank-you"]'::jsonb, '["mixed"]'::jsonb, '["deluxe", "premium"]'::jsonb, true, true, 'Keep water fresh, avoid direct heat', 'RSE-004'),
('Yellow Sunshine Roses', 'Bright yellow roses bringing joy and warmth', 'roses', 94.99, 114.99, 30, '["https://images.unsplash.com/photo-1563241527-3004b7be0ffd"]'::jsonb, '["friendship", "get-well", "celebration"]'::jsonb, '["yellow"]'::jsonb, '["standard", "deluxe"]'::jsonb, false, false, 'Change water daily, trim stems regularly', 'RSE-005'),

-- Bouquets
('Spring Garden Bouquet', 'Mixed seasonal flowers in vibrant spring colors', 'bouquets', 79.99, 99.99, 45, '["https://images.unsplash.com/photo-1487070183336-b863922373d4"]'::jsonb, '["birthday", "thank-you", "just-because"]'::jsonb, '["mixed"]'::jsonb, '["standard", "deluxe", "premium"]'::jsonb, true, false, 'Keep in cool place, change water every 2 days', 'BQT-001'),
('Luxury Mixed Bouquet', 'Premium arrangement with roses, lilies, and orchids', 'bouquets', 159.99, 199.99, 20, '["https://images.unsplash.com/photo-1535268647677-300dbf3d78d1"]'::jsonb, '["anniversary", "celebration", "luxury"]'::jsonb, '["mixed"]'::jsonb, '["premium"]'::jsonb, true, true, 'Professional care recommended, change water daily', 'BQT-002'),
('Wildflower Meadow', 'Natural arrangement of fresh wildflowers', 'bouquets', 69.99, 84.99, 55, '["https://images.unsplash.com/photo-1508610048659-a06b669e3321"]'::jsonb, '["casual", "thank-you", "just-because"]'::jsonb, '["mixed"]'::jsonb, '["standard", "deluxe"]'::jsonb, false, false, 'Minimal care needed, change water weekly', 'BQT-003'),
('Tropical Paradise', 'Exotic tropical flowers in bold colors', 'bouquets', 139.99, 169.99, 15, '["https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d"]'::jsonb, '["celebration", "exotic", "summer"]'::jsonb, '["mixed"]'::jsonb, '["deluxe", "premium"]'::jsonb, true, false, 'Keep warm, mist daily, change water every 3 days', 'BQT-004'),
('Pastel Dreams', 'Soft pastel flowers creating a romantic atmosphere', 'bouquets', 89.99, 109.99, 40, '["https://images.unsplash.com/photo-1515041219749-89347f83291a"]'::jsonb, '["wedding", "romantic", "baby-shower"]'::jsonb, '["mixed"]'::jsonb, '["standard", "deluxe"]'::jsonb, false, true, 'Keep cool, change water every 2 days', 'BQT-005'),

-- Orchids
('Elegant White Orchid', 'Single stem white phalaenopsis orchid in decorative pot', 'orchids', 59.99, 74.99, 30, '["https://images.unsplash.com/photo-1581289595146-3a38c0b4d8a9"]'::jsonb, '["office", "home-decor", "thank-you"]'::jsonb, '["white"]'::jsonb, '["single", "double"]'::jsonb, false, false, 'Water weekly, indirect light, avoid overwatering', 'ORC-001'),
('Purple Orchid Collection', 'Stunning purple orchids in premium ceramic pot', 'orchids', 79.99, 94.99, 25, '["https://images.unsplash.com/photo-1583624369084-fb2cd0f0cb32"]'::jsonb, '["luxury", "office", "home-decor"]'::jsonb, '["purple"]'::jsonb, '["standard", "deluxe"]'::jsonb, true, false, 'Water every 7-10 days, bright indirect light', 'ORC-002'),
('Pink Orchid Garden', 'Beautiful pink orchids with multiple blooms', 'orchids', 69.99, 84.99, 28, '["https://images.unsplash.com/photo-1584794171574-fe3f84b43838"]'::jsonb, '["home-decor", "office", "thank-you"]'::jsonb, '["pink"]'::jsonb, '["standard"]'::jsonb, false, true, 'Minimal watering, good drainage essential', 'ORC-003'),

-- Tulips
('Classic Red Tulips', 'Fresh Dutch red tulips in elegant arrangement', 'tulips', 54.99, 69.99, 60, '["https://images.unsplash.com/photo-1520763185298-1b434c919102"]'::jsonb, '["spring", "romantic", "birthday"]'::jsonb, '["red"]'::jsonb, '["standard", "deluxe"]'::jsonb, false, false, 'Change water daily, keep stems trimmed', 'TLP-001'),
('Rainbow Tulip Bunch', 'Mixed color tulips creating a cheerful display', 'tulips', 64.99, 79.99, 45, '["https://images.unsplash.com/photo-1518709594023-6eab9bab7b23"]'::jsonb, '["birthday", "spring", "celebration"]'::jsonb, '["mixed"]'::jsonb, '["standard", "deluxe", "premium"]'::jsonb, true, true, 'Fresh water daily, cool environment preferred', 'TLP-002'),
('White Tulip Elegance', 'Pure white tulips for sophisticated settings', 'tulips', 59.99, 74.99, 50, '["https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11"]'::jsonb, '["wedding", "sympathy", "elegant"]'::jsonb, '["white"]'::jsonb, '["standard", "deluxe"]'::jsonb, false, false, 'Keep cool, change water every 2 days', 'TLP-003'),

-- Lilies
('Stargazer Lily Bouquet', 'Fragrant pink stargazer lilies', 'lilies', 84.99, 104.99, 35, '["https://images.unsplash.com/photo-1527536310331-67640ef61d3b"]'::jsonb, '["romantic", "celebration", "luxury"]'::jsonb, '["pink"]'::jsonb, '["standard", "deluxe"]'::jsonb, true, false, 'Remove pollen to prevent staining, change water regularly', 'LLY-001'),
('White Oriental Lilies', 'Pristine white lilies with elegant fragrance', 'lilies', 89.99, 109.99, 30, '["https://images.unsplash.com/photo-1563210301-38575d8a2d4c"]'::jsonb, '["wedding", "sympathy", "elegant"]'::jsonb, '["white"]'::jsonb, '["standard", "premium"]'::jsonb, false, false, 'Keep away from pets, change water every 2 days', 'LLY-002'),
('Yellow Asiatic Lilies', 'Bright yellow lilies bringing sunshine indoors', 'lilies', 74.99, 89.99, 40, '["https://images.unsplash.com/photo-1525310072745-f49212b5ac6d"]'::jsonb, '["friendship", "celebration", "thank-you"]'::jsonb, '["yellow"]'::jsonb, '["standard", "deluxe"]'::jsonb, false, true, 'Trim stems regularly, fresh water essential', 'LLY-003'),

-- Seasonal
('Summer Sunflower Collection', 'Bright sunflowers perfect for summer celebrations', 'seasonal', 69.99, 84.99, 40, '["https://images.unsplash.com/photo-1508610048659-a06b669e3321"]'::jsonb, '["summer", "birthday", "thank-you"]'::jsonb, '["yellow"]'::jsonb, '["standard", "deluxe"]'::jsonb, true, true, 'Full sun preferred, water when soil is dry', 'SSN-001'),
('Autumn Harvest Arrangement', 'Warm autumn colors with seasonal blooms', 'seasonal', 79.99, 99.99, 35, '["https://images.unsplash.com/photo-1513828583688-c52646db42da"]'::jsonb, '["autumn", "thanksgiving", "harvest"]'::jsonb, '["mixed"]'::jsonb, '["standard", "deluxe", "premium"]'::jsonb, true, false, 'Keep in moderate temperature, water regularly', 'SSN-002'),
('Winter Wonderland', 'White and silver flowers perfect for winter', 'seasonal', 94.99, 114.99, 25, '["https://images.unsplash.com/photo-1519225421980-715cb0215aed"]'::jsonb, '["winter", "christmas", "holiday"]'::jsonb, '["white", "silver"]'::jsonb, '["deluxe", "premium"]'::jsonb, true, true, 'Keep cool, mist occasionally', 'SSN-003'),
('Cherry Blossom Spring', 'Delicate cherry blossom branches', 'seasonal', 119.99, 144.99, 20, '["https://images.unsplash.com/photo-1490750967868-88aa4486c946"]'::jsonb, '["spring", "celebration", "luxury"]'::jsonb, '["pink", "white"]'::jsonb, '["premium"]'::jsonb, true, true, 'Mist daily, keep in bright indirect light', 'SSN-004'),

-- Gift Sets
('Romance Gift Set', 'Roses with premium chocolates and champagne', 'gift-sets', 179.99, 219.99, 15, '["https://images.unsplash.com/photo-1518895949257-7621c3c786d7"]'::jsonb, '["romantic", "anniversary", "valentines"]'::jsonb, '["red"]'::jsonb, '["premium"]'::jsonb, true, false, 'Keep flowers fresh, store chocolates cool', 'GFT-001'),
('Spa Relaxation Set', 'Lavender bouquet with spa essentials', 'gift-sets', 129.99, 154.99, 20, '["https://images.unsplash.com/photo-1515041219749-89347f83291a"]'::jsonb, '["relaxation", "thank-you", "wellness"]'::jsonb, '["purple"]'::jsonb, '["deluxe", "premium"]'::jsonb, false, true, 'Follow individual product care instructions', 'GFT-002'),
('New Baby Celebration', 'Pastel flowers with baby gift basket', 'gift-sets', 149.99, 179.99, 18, '["https://images.unsplash.com/photo-1515041219749-89347f83291a"]'::jsonb, '["baby-shower", "new-baby", "celebration"]'::jsonb, '["mixed"]'::jsonb, '["deluxe"]'::jsonb, true, true, 'Keep flowers fresh, wash baby items before use', 'GFT-003')
) AS v(name, description, category, price, original_price, stock_quantity, images, occasions, colors, sizes, is_featured, is_new, care_instructions, sku)
WHERE NOT EXISTS (
  SELECT 1 FROM public.products WHERE sku = v.sku
);

-- Insert sample coupons (only if they don't exist)
INSERT INTO public.coupons (code, type, value, minimum_amount, maximum_discount, usage_limit, expires_at, is_active)
SELECT * FROM (VALUES
('WELCOME10', 'percentage', 10, 50, 20, 100, NOW() + INTERVAL '3 months', true),
('SPRING25', 'percentage', 25, 100, 50, 50, NOW() + INTERVAL '1 month', true),
('FREESHIP', 'fixed', 15, 75, 15, 200, NOW() + INTERVAL '2 months', true),
('LOYAL50', 'fixed', 50, 200, 50, 30, NOW() + INTERVAL '6 months', true)
) AS v(code, type, value, minimum_amount, maximum_discount, usage_limit, expires_at, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.coupons WHERE code = v.code
);