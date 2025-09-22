-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews for their purchases" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = auth.uid() 
    AND oi.product_id = reviews.product_id
    AND o.status = 'delivered'
  )
);

CREATE POLICY "Users can update their own reviews" 
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL,
  minimum_amount NUMERIC DEFAULT 0,
  maximum_discount NUMERIC,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Coupons are viewable by everyone (for validation)
CREATE POLICY "Coupons are viewable by everyone" 
ON public.coupons 
FOR SELECT 
USING (is_active = true);

-- Only admins can manage coupons
CREATE POLICY "Admins can manage coupons" 
ON public.coupons 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  slug VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories are viewable by everyone
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Update reviews trigger
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, description, slug, sort_order) VALUES
('Roses', 'Beautiful roses in various colors and arrangements', 'roses', 1),
('Bouquets', 'Pre-made bouquets for all occasions', 'bouquets', 2),
('Wedding', 'Elegant flowers for your special day', 'wedding', 3),
('Birthday', 'Colorful arrangements for birthday celebrations', 'birthday', 4),
('Anniversary', 'Romantic flowers for anniversaries', 'anniversary', 5),
('Sympathy', 'Thoughtful arrangements for sympathy', 'sympathy', 6),
('Corporate', 'Professional arrangements for business events', 'corporate', 7),
('Seasonal', 'Seasonal flowers and decorations', 'seasonal', 8);

-- Insert sample coupons
INSERT INTO public.coupons (code, type, value, minimum_amount, usage_limit, expires_at) VALUES
('WELCOME10', 'percentage', 10, 50, 100, now() + interval '30 days'),
('SAVE20', 'fixed', 20, 100, 50, now() + interval '60 days'),
('ANNIVERSARY15', 'percentage', 15, 75, 75, now() + interval '45 days');