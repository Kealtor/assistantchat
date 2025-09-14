-- Update the trigger function to grant the first workflow from config instead of hardcoded 'assistant'
CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Grant the first/default workflow permission to new users (assistant)
  INSERT INTO public.user_permissions (user_id, workflow_id)
  VALUES (NEW.id, 'assistant')
  ON CONFLICT (user_id, workflow_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;