-- Grant default assistant permission to all existing and new users
-- This migration ensures everyone has access to the basic assistant workflow

-- Insert assistant permission for any existing users (if any exist)
-- This is safe because we have a unique constraint on (user_id, workflow_id)
INSERT INTO public.user_permissions (user_id, workflow_id) 
SELECT 
  id as user_id,
  'assistant' as workflow_id
FROM auth.users
ON CONFLICT (user_id, workflow_id) DO NOTHING;

-- Create a function to automatically grant assistant permission to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant assistant workflow permission to new users
  INSERT INTO public.user_permissions (user_id, workflow_id)
  VALUES (NEW.id, 'assistant')
  ON CONFLICT (user_id, workflow_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically grant assistant permissions for new users
CREATE TRIGGER on_auth_user_created_permissions
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_permissions();

-- Example: Grant additional workflow permissions to specific users
-- Uncomment and modify as needed for your use case
-- INSERT INTO public.user_permissions (user_id, workflow_id) VALUES 
--   ('user-uuid-here', 'calendar'),
--   ('user-uuid-here', 'notes');

-- You can use this query to grant permissions to users:
-- INSERT INTO public.user_permissions (user_id, workflow_id) 
-- SELECT auth.uid(), 'calendar' WHERE NOT EXISTS (
--   SELECT 1 FROM public.user_permissions 
--   WHERE user_id = auth.uid() AND workflow_id = 'calendar'
-- );