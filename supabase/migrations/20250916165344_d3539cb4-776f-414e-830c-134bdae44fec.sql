-- Add notes column to habit_entries table to store daily notes
ALTER TABLE public.habit_entries 
ADD COLUMN notes TEXT;