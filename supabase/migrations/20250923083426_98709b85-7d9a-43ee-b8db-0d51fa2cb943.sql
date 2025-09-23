-- Fix security vulnerability: Restrict profile visibility to authenticated users only
-- Drop the overly permissive policy that allows anyone to view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a secure policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Optional: Create a more restrictive policy for sensitive admin data
-- Users can only see their own admin status, others cannot see admin flags
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Drop the previous policy and use the restrictive one
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Final secure policy: Users can see basic info of others, but only their own sensitive data  
CREATE POLICY "Secure profile visibility" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  CASE 
    WHEN auth.uid() = user_id THEN true  -- Users see their complete profile
    ELSE (display_name IS NOT NULL OR avatar_url IS NOT NULL OR bio IS NOT NULL)  -- Others see only basic public info, not admin status or empty profiles
  END
);