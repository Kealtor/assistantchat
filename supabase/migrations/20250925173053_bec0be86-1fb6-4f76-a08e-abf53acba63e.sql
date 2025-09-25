-- Update existing user_permissions records from 'assistant' to 'Personal Coach'
UPDATE public.user_permissions 
SET workflow_id = 'Personal Coach' 
WHERE workflow_id = 'assistant';

-- Update the database function to use the correct workflow name
CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Grant the first/default workflow permission to new users (Personal Coach)
  INSERT INTO public.user_permissions (user_id, workflow_id)
  VALUES (NEW.id, 'Personal Coach')
  ON CONFLICT (user_id, workflow_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;