-- Fix critical security vulnerabilities: Remove overly permissive RLS policies
-- These policies allowed any authenticated user to access sensitive data

-- Drop the overly permissive policies that expose customer data
DROP POLICY IF EXISTS "Authenticated users only - user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users only - orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users only - cart_items" ON public.cart_items;
DROP POLICY IF EXISTS "Authenticated users only - coupons" ON public.coupons;

-- The existing user-specific policies remain in place and provide proper protection:
-- user_profiles: "Users can view their own profile" (auth.uid() = user_id)
-- orders: "Users can view their own orders" (auth.uid() = user_id)
-- cart_items: Multiple user-specific policies already in place
-- coupons: "Admins can manage coupons" only - users must use validate_coupon_code() function

-- Note: These existing policies properly restrict access so users can only see their own data
-- Admins can access all data through role-based policies using has_role() function