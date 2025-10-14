-- Fix security issue: Convert RESTRICTIVE deny policies to PERMISSIVE
-- This ensures anonymous users cannot access sensitive data

-- Drop existing RESTRICTIVE policies
DROP POLICY IF EXISTS "Deny all anonymous access to user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Deny all anonymous access to orders" ON public.orders;
DROP POLICY IF EXISTS "Deny all anonymous access to cart_items" ON public.cart_items;
DROP POLICY IF EXISTS "Deny all anonymous access to coupons" ON public.coupons;

-- Create new PERMISSIVE policies that properly deny anonymous access
CREATE POLICY "Authenticated users only - user_profiles"
ON public.user_profiles
AS PERMISSIVE
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "Authenticated users only - orders"
ON public.orders
AS PERMISSIVE
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "Authenticated users only - cart_items"
ON public.cart_items
AS PERMISSIVE
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "Authenticated users only - coupons"
ON public.coupons
AS PERMISSIVE
FOR ALL
TO authenticated
USING (true);

-- Ensure existing user-specific policies remain in place
-- These will further restrict access within authenticated users