-- Add pinned column to chats table
ALTER TABLE public.chats ADD COLUMN pinned BOOLEAN DEFAULT false;