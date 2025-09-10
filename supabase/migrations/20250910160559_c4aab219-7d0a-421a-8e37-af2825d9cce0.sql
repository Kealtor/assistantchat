-- Fix the search path security warning for the new user permissions function
CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant assistant workflow permission to new users
  INSERT INTO public.user_permissions (user_id, workflow_id)
  VALUES (NEW.id, 'assistant')
  ON CONFLICT (user_id, workflow_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;