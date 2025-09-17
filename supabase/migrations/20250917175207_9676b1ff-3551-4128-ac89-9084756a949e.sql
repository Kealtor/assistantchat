-- Create chat-media storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-media', 'chat-media', false);

-- Create RLS policies for chat-media bucket
CREATE POLICY "Users can view their own chat media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own chat media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own chat media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own chat media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);