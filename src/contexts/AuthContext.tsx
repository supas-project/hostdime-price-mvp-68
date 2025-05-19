
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  isSupabaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constantes para o usuário admin padrão - com verificação precisa
const ADMIN_EMAIL = "admin@hostdime.com.br";
const DEFAULT_ADMIN_PASSWORD = "H0stD1m3@2025";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para criar o usuário admin padrão
  const createAdminUser = async () => {
    try {
      // Tentar fazer login com o usuário admin para verificar se ele existe
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
      });

      // Se recebemos um erro que não seja de credenciais inválidas, registramos
      if (signInError && signInError.message !== 'Invalid login credentials') {
        console.log("Verificando se o usuário admin existe:", signInError);
      }

      // Se conseguimos fazer login, o usuário já existe
      if (signInData?.user) {
        console.log("Usuário admin já existe");
        
        // Fazer logout depois de verificar que o usuário existe
        await supabase.auth.signOut();
        return;
      }

      // Se não conseguimos fazer login, tentamos criar o usuário
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        options: {
          // Definir para não requerer confirmação de email, já que é um usuário padrão
          emailRedirectTo: window.location.origin,
          data: {
            is_admin: true
          }
        }
      });

      if (signUpError) {
        console.error("Erro ao criar usuário admin:", signUpError);
        return;
      }

      if (signUpData?.user) {
        console.log("Usuário admin criado com sucesso");
        
        // Se o usuário foi criado com sucesso, vamos tentar confirmar manualmente
        try {
          // Recuperar a sessão do usuário recém-criado
          if (signUpData.session) {
            console.log("Usuário admin confirmado automaticamente");
          }
        } catch (confirmError) {
          console.error("Erro ao confirmar email do admin:", confirmError);
        }
        
        // Fazer logout depois de criar o usuário
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Erro ao criar usuário admin:", error);
    }
  };

  // Check for existing session on initial load with improved retry logic
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Verificar com o Supabase se a sessão ainda é válida
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          setLoading(false);
          return;
        }
        
        if (session) {
          console.log("Sessão obtida do Supabase:", session.user.email);
          setIsAuthenticated(true);
          setUser(session.user);
          
          // Verifica se o usuário é admin por comparação exata do email
          const isUserAdmin = session.user.email === ADMIN_EMAIL;
          setIsAdmin(isUserAdmin);
          
          console.log("Sessão restaurada. Usuário:", session.user.email, "isAdmin:", isUserAdmin);
        } else {
          console.log("Nenhuma sessão encontrada");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Tenta criar o usuário admin
    createAdminUser();
    
    // Set up auth listener with improved error handling
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          setUser(session.user);
          
          // Verifica se o usuário é admin por comparação exata do email
          const isUserAdmin = session.user.email === ADMIN_EMAIL;
          setIsAdmin(isUserAdmin);
          
          console.log("Sign In:", session.user.email, "isAdmin:", isUserAdmin);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Atualizar a sessão local quando o token for atualizado
          console.log("Token refreshed for:", session.user.email);
          const isUserAdmin = session.user.email === ADMIN_EMAIL;
          setIsAdmin(isUserAdmin);
          setUser(session.user);
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error("Erro ao fazer login", {
          description: error.message
        });
        return false;
      }
      
      // CORREÇÃO: Adicionar log para verificar corretamente o status de admin após login
      if (data && data.user) {
        const isUserAdmin = data.user.email === ADMIN_EMAIL;
        console.log("Login bem-sucedido:", data.user.email, "isAdmin:", isUserAdmin);
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Ocorreu um erro durante o login");
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Primeiramente, limpar os estados locais para garantir uma resposta rápida na UI
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      
      // Agora vamos fazer o logout no Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Apenas desloga a sessão atual, não todas as sessões
      });
      
      if (error) {
        console.error("Erro ao fazer logout no Supabase:", error);
        return;
      }
      
      toast.success("Logout realizado com sucesso");
      
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, não exibimos mensagem para o usuário pois já limpamos a sessão local
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAdmin, 
      user, 
      login, 
      logout, 
      loading,
      isSupabaseReady: true 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
