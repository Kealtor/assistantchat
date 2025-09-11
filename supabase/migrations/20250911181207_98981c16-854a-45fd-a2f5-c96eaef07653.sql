-- Add admin role to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create RLS policy for admin access to WorkflowPermissions functionality
-- Allow admins to view all user permissions
CREATE POLICY "Admins can view all user permissions" 
ON public.user_permissions 
FOR SELECT 
USING (public.is_current_user_admin());

-- Allow admins to grant permissions
CREATE POLICY "Admins can grant permissions" 
ON public.user_permissions 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

-- Allow admins to revoke permissions  
CREATE POLICY "Admins can revoke permissions" 
ON public.user_permissions 
FOR DELETE 
USING (public.is_current_user_admin());