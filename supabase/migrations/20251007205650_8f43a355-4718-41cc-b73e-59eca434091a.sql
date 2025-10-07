-- Ensure RLS is enabled on coupons table
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies that might allow public access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.coupons;
DROP POLICY IF EXISTS "Public coupons are viewable" ON public.coupons;
DROP POLICY IF EXISTS "Coupons are viewable by everyone" ON public.coupons;

-- Ensure the admin policy exists (restrictive)
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons"
ON public.coupons
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Add explicit deny policy for anonymous users
CREATE POLICY "Deny all anonymous access to coupons"
ON public.coupons
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Verify validate_coupon_code function exists and is the ONLY way to validate coupons
-- (Already created in previous migration, but adding comment for documentation)
COMMENT ON FUNCTION public.validate_coupon_code(text) IS 
  'Secure function to validate a single coupon code. This is the ONLY approved method for checking coupon validity. Direct table access is restricted to admins only.';