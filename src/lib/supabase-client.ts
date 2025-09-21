/**
 * Configurable Supabase Client
 * 
 * This module provides a configurable wrapper around the auto-generated Supabase client.
 * It allows switching between different Supabase instances without modifying core files.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { getActiveInstance } from '@/config/supabase-instances';

let _client: SupabaseClient<Database> | null = null;

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
 * Configurable Supabase client (lazy initialized)
 * Use this instead of the auto-generated client when you need instance switching capability
 */
export const configurableSupabase = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    if (!_client) {
      _client = createConfigurableClient();
    }
    return _client[prop as keyof SupabaseClient<Database>];
  }
});

/**
 * Re-export the original client for backward compatibility
 * Import this when you don't need instance switching
 */
export { supabase } from '@/integrations/supabase/client';