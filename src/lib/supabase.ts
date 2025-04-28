
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Supabase client initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Criamos um cliente mockado que será usado quando o Supabase não estiver configurado
const createMockClient = () => {
  console.warn('⚠️ Usando cliente Supabase mockado. As funcionalidades de autenticação não funcionarão corretamente.');
  
  // Implementação simplificada que simula a API do Supabase
  return {
    auth: {
      getSession: async () => ({ data: null, error: null }),
      getUser: async () => ({ data: null, error: null }),
      signInWithPassword: async () => {
        toast.error('Supabase não está configurado', {
          description: 'Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY'
        });
        return { data: null, error: { message: 'Supabase não configurado' } };
      },
      signInWithOAuth: async () => {
        toast.error('Supabase não está configurado', {
          description: 'Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY'
        });
        return { data: null, error: { message: 'Supabase não configurado' } };
      },
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ 
        subscription: { unsubscribe: () => {} }
      })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    })
  };
};

// Inicializa o cliente Supabase ou um mock se as variáveis não estiverem disponíveis
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as ReturnType<typeof createClient>;

// Função helper para verificar se o Supabase está corretamente configurado
export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey);

