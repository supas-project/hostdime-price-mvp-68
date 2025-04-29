
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Re-export the configured client to maintain compatibility
export const supabase = supabaseClient;

// Helper function to verificar se o Supabase está configurado
export const isSupabaseConfigured = () => true; // Sempre retorna true pois estamos usando o cliente oficial
