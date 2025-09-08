/**
 * Supabase Configuration
 * 
 * This file contains the configuration for your Supabase instance.
 * To switch to a different Supabase project, update the values below.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Current Supabase Instance Configuration
 * 
 * INSTRUCTIONS TO SWITCH SUPABASE INSTANCES:
 * 1. Replace SUPABASE_URL with your new project URL
 * 2. Replace SUPABASE_ANON_KEY with your new project's anon key
 * 3. Update the database schema if needed (see README.md)
 * 
 * You can find these values in your Supabase project dashboard:
 * Project Settings > API > Project URL and Project API keys
 */
export const supabaseConfig: SupabaseConfig = {
  // Replace with your Supabase project URL
  url: "https://paodisbyfnmiljjognxl.supabase.co",
  
  // Replace with your Supabase project anon key  
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2Rpc2J5Zm5taWxqam9nbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMTQ1MzUsImV4cCI6MjA3Mjc5MDUzNX0.j5yXfiLajabCg0VazWl3r8HMSP9xtiZD0BuxEc9G31E"
};

/**
 * Validation function to ensure config is properly set
 */
export const validateSupabaseConfig = (config: SupabaseConfig): void => {
  if (!config.url) {
    throw new Error('Supabase URL is required. Please check src/config/supabase.ts');
  }
  
  if (!config.anonKey) {
    throw new Error('Supabase anon key is required. Please check src/config/supabase.ts');
  }
  
  if (!config.url.includes('supabase.co')) {
    console.warn('Warning: URL does not appear to be a valid Supabase URL');
  }
};