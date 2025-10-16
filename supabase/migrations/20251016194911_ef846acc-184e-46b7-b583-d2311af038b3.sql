-- Add show_details column to habits table
ALTER TABLE habits 
ADD COLUMN show_details boolean DEFAULT true;