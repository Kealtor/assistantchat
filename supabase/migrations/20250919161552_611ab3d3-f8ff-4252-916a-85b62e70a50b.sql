-- Add separate media column to chats table
ALTER TABLE public.chats 
ADD COLUMN media jsonb DEFAULT '[]'::jsonb;