-- Add image attachments support to journal entries
ALTER TABLE public.journal_entries 
ADD COLUMN images text[] DEFAULT '{}';

-- Create storage bucket for journal images
INSERT INTO storage.buckets (id, name, public) VALUES ('journal-images', 'journal-images', false);

-- Create storage policies for journal images
CREATE POLICY "Users can view their own journal images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own journal images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own journal images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own journal images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);