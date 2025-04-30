
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

// Constantes para o usuário admin padrão
const DEFAULT_ADMIN_EMAIL = "admin@hostdime.com.br";
const DEFAULT_ADMIN_PASSWORD = "H0stD1m3@2025";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseReady, setIsSupabaseReady] = useState(true);

  // Função para criar o usuário admin padrão
  const createAdminUser = async () => {
    try {
      // Tentar fazer login com o usuário admin para verificar se ele existe
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: DEFAULT_ADMIN_EMAIL,
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
        email: DEFAULT_ADMIN_EMAIL,
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

  // Check for existing session on initial load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          return;
        }
        
        if (session) {
          setIsAuthenticated(true);
          setUser(session.user);
          
          // Check if user is admin (example: check user metadata or specific email domain)
          const isUserAdmin = session.user.email?.endsWith('@hostdime.com.br') || false;
          setIsAdmin(isUserAdmin);
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
    
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          setUser(session.user);
          
          // Check if admin
          const isUserAdmin = session.user.email?.endsWith('@hostdime.com.br') || false;
          setIsAdmin(isUserAdmin);
          
          // Toast removido para evitar poluição visual
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
          // Toast removido para evitar poluição visual
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
      
      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Ocorreu um erro durante o login");
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error("Erro ao fazer logout");
        return;
      }
      
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Ocorreu um erro ao finalizar a sessão");
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
