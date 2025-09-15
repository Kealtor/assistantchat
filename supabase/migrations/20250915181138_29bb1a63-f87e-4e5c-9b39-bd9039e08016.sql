-- Add acceptance criteria and notes fields to habits table
ALTER TABLE public.habits 
ADD COLUMN acceptance_criteria TEXT,
ADD COLUMN notes TEXT;