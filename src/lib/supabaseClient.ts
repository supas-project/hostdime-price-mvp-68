
import { createClient } from '@supabase/supabase-js';

/**
 * Enhanced Supabase client with explicit session persistence configuration.
 * This wrapper ensures consistent auth behavior across browsers and prevents token refresh issues.
 */
export const supabase = createClient(
  "https://nglwjdpocxelvarqjgts.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbHdqZHBvY3hlbHZhcnFqZ3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTE3OTMsImV4cCI6MjA2MTQyNzc5M30.8xCetXorVi2SehrE_Tfgf-I_96o75alWXTMSHZLNh7s",
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,  // Desabilitamos para evitar conflitos com navegação
      flowType: 'implicit',
    },
  }
);
