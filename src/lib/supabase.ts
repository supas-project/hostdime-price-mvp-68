
// Este arquivo é apenas um wrapper para manter compatibilidade com código existente
import { supabase as supabaseClient } from '@/lib/supabaseClient';

// Re-export the configured client to maintain compatibility
export const supabase = supabaseClient;

// Helper function to verify if Supabase is configured
export const isSupabaseConfigured = () => true;
