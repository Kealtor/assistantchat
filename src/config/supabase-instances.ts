/**
 * Supabase Instance Configuration
 * 
 * This file allows you to easily switch between different Supabase instances
 * without modifying the auto-generated client file.
 */

export interface SupabaseInstance {
  name: string;
  url: string;
  anonKey: string;
  description?: string;
}

/**
 * Available Supabase Instances
 * 
 * Add your different Supabase instances here (development, staging, production, etc.)
 */
export const SUPABASE_INSTANCES: Record<string, SupabaseInstance> = {
  // Current production instance
  current: {
    name: "Current Instance",
    url: "https://paodisbyfnmiljjognxl.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2Rpc2J5Zm5taWxqam9nbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMTQ1MzUsImV4cCI6MjA3Mjc5MDUzNX0.j5yXfiLajabCg0VazWl3r8HMSP9xtiZD0BuxEc9G31E",
    description: "Current production instance"
  },
  
  // Example additional instances (uncomment and configure as needed)
  /*
  development: {
    name: "Development",
    url: "https://your-dev-project.supabase.co",
    anonKey: "your-dev-anon-key",
    description: "Development environment"
  },
  
  staging: {
    name: "Staging", 
    url: "https://your-staging-project.supabase.co",
    anonKey: "your-staging-anon-key",
    description: "Staging environment"
  },
  
  production: {
    name: "Production",
    url: "https://your-prod-project.supabase.co", 
    anonKey: "your-prod-anon-key",
    description: "Production environment"
  }
  */
};

/**
 * Active Instance Configuration
 * 
 * CHANGE THIS to switch between different Supabase instances
 * Use any key from SUPABASE_INSTANCES above
 */
export const ACTIVE_INSTANCE = 'current';

/**
 * Get the currently active Supabase instance configuration
 */
export const getActiveInstance = (): SupabaseInstance => {
  const instance = SUPABASE_INSTANCES[ACTIVE_INSTANCE];
  
  if (!instance) {
    throw new Error(
      `Invalid ACTIVE_INSTANCE: "${ACTIVE_INSTANCE}". ` +
      `Available instances: ${Object.keys(SUPABASE_INSTANCES).join(', ')}`
    );
  }
  
  return instance;
};

/**
 * Validate instance configuration
 */
export const validateInstance = (instance: SupabaseInstance): void => {
  if (!instance.url) {
    throw new Error(`Supabase URL is required for instance: ${instance.name}`);
  }
  
  if (!instance.anonKey) {
    throw new Error(`Supabase anon key is required for instance: ${instance.name}`);
  }
  
  if (!instance.url.includes('supabase.co')) {
    console.warn(`Warning: URL for ${instance.name} does not appear to be a valid Supabase URL`);
  }
  
  console.log(`✅ Connected to Supabase instance: ${instance.name} (${instance.description || 'No description'})`);
};

// Validate the active instance on import
const activeInstance = getActiveInstance();
validateInstance(activeInstance);