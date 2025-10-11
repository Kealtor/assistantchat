-- Enable realtime for card_content table
ALTER TABLE public.card_content REPLICA IDENTITY FULL;

-- Add table to realtime publication (if not already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.card_content;