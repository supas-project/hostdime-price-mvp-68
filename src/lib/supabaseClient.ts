
import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseInstance } from '@/integrations/supabase/client';

/**
 * Enhanced Supabase client with explicit session persistence configuration.
 * This wrapper ensures consistent auth behavior across browsers and prevents token refresh issues.
 */
export const supabase = createClient(
  supabaseInstance.supabaseUrl,
  supabaseInstance.supabaseKey,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'implicit',
    },
  }
);
