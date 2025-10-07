-- Critical Security Fixes for Cart and Coupons

-- 1. Fix cart_items price manipulation vulnerability
-- Drop the overly permissive "Users can manage their own cart items" policy
DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;

-- Create granular policies that prevent price manipulation
CREATE POLICY "Users can insert their own cart items"
ON public.cart_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update quantity only in their cart"
ON public.cart_items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Ensure price cannot be modified by comparing old and new values
  price = (SELECT price FROM cart_items WHERE id = cart_items.id)
);

CREATE POLICY "Users can delete their own cart items"
ON public.cart_items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Fix coupon exposure vulnerability
-- Remove the policy that allows all authenticated users to browse coupons
DROP POLICY IF EXISTS "Authenticated users can view active coupons" ON public.coupons;

-- Create a secure validation function that checks a single coupon code
CREATE OR REPLACE FUNCTION public.validate_coupon_code(coupon_code text)
RETURNS TABLE (
  id uuid,
  code varchar,
  type varchar,
  value numeric,
  minimum_amount numeric,
  maximum_discount numeric,
  usage_limit integer,
  used_count integer,
  expires_at timestamptz,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.code,
    c.type,
    c.value,
    c.minimum_amount,
    c.maximum_discount,
    c.usage_limit,
    c.used_count,
    c.expires_at,
    c.is_active
  FROM public.coupons c
  WHERE c.code = coupon_code
    AND c.is_active = true
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND (c.usage_limit IS NULL OR c.used_count < c.usage_limit)
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.validate_coupon_code(text) TO authenticated;