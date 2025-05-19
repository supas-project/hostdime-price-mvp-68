
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nglwjdpocxelvarqjgts.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbHdqZHBvY3hlbHZhcnFqZ3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTE3OTMsImV4cCI6MjA2MTQyNzc5M30.8xCetXorVi2SehrE_Tfgf-I_96o75alWXTMSHZLNh7s";

/**
 * Enhanced Supabase client with explicit session persistence configuration.
 * This ensures consistent auth behavior across browsers and prevents token refresh issues.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storageKey: 'hostdime_auth',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
