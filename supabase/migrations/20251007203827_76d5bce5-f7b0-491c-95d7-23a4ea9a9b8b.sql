-- Fix security issues by adding explicit denial policies for anonymous users

-- 1. Add explicit denial of all anonymous access to user_profiles table
CREATE POLICY "Deny all anonymous access to user_profiles" 
ON public.user_profiles 
FOR ALL 
TO anon
USING (false);

-- 2. Add explicit denial of all anonymous access to orders table  
CREATE POLICY "Deny all anonymous access to orders"
ON public.orders
FOR ALL
TO anon
USING (false);

-- 3. Add explicit denial of all anonymous access to cart_items table
CREATE POLICY "Deny all anonymous access to cart_items"
ON public.cart_items
FOR ALL
TO anon
USING (false);

-- 4. Restrict coupons to authenticated users only (remove public access)
DROP POLICY IF EXISTS "Coupons are viewable by everyone" ON public.coupons;

CREATE POLICY "Authenticated users can view active coupons"
ON public.coupons
FOR SELECT
TO authenticated
USING (is_active = true);