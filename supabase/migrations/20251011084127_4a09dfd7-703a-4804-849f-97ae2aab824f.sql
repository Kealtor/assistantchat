-- Create enum for card types
CREATE TYPE public.card_type AS ENUM ('hero', 'reflection', 'habits', 'journal', 'quickstart', 'roadmap');

-- Create table for dynamic card content
CREATE TABLE public.card_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type card_type NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_type)
);

-- Create table for update logs (audit trail)
CREATE TABLE public.card_update_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_content_id UUID REFERENCES public.card_content(id) ON DELETE CASCADE NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  update_source TEXT NOT NULL, -- 'user', 'service', 'scheduled'
  idempotency_key TEXT,
  request_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.card_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_update_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for card_content
-- Users can read their own cards
CREATE POLICY "Users can view their own card content"
ON public.card_content
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own cards
CREATE POLICY "Users can insert their own card content"
ON public.card_content
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own cards
CREATE POLICY "Users can update their own card content"
ON public.card_content
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Service role can do everything (bypasses RLS when using service_role key)
CREATE POLICY "Service role has full access to card content"
ON public.card_content
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- RLS Policies for card_update_logs
-- Users can view their own update logs
CREATE POLICY "Users can view their own update logs"
ON public.card_update_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.card_content
    WHERE id = card_update_logs.card_content_id
    AND user_id = auth.uid()
  )
);

-- Service role can insert logs
CREATE POLICY "Service role can insert update logs"
ON public.card_update_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Authenticated users can insert logs for their cards
CREATE POLICY "Users can insert update logs for their cards"
ON public.card_update_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.card_content
    WHERE id = card_update_logs.card_content_id
    AND user_id = auth.uid()
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_card_content_updated_at
BEFORE UPDATE ON public.card_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_card_content_user_type ON public.card_content(user_id, card_type);
CREATE INDEX idx_card_update_logs_card_id ON public.card_update_logs(card_content_id);
CREATE INDEX idx_card_update_logs_idempotency ON public.card_update_logs(idempotency_key) WHERE idempotency_key IS NOT NULL;