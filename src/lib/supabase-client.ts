/**
 * Configurable Supabase Client
 * 
 * This module provides a configurable wrapper around the auto-generated Supabase client.
 * It allows switching between different Supabase instances without modifying core files.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { getActiveInstance } from '@/config/supabase-instances';

/**
 * Create a new Supabase client with the active instance configuration
 */
const createConfigurableClient = (): SupabaseClient<Database> => {
  const instance = getActiveInstance();
  
  return createClient<Database>(instance.url, instance.anonKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
};

/**
 * Configurable Supabase client
 * Use this instead of the auto-generated client when you need instance switching capability
 */
export const configurableSupabase = createConfigurableClient();

/**
 * Re-export the original client for backward compatibility
 * Import this when you don't need instance switching
 */
export { supabase } from '@/integrations/supabase/client';