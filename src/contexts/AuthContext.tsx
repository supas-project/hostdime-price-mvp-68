
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
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
      // Verificar se o usuário já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('auth.users')
        .select('*')
        .eq('email', DEFAULT_ADMIN_EMAIL)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.log("Verificando se o usuário admin já existe:", checkError);
        // Tentamos criar de qualquer forma
      }

      if (!existingUser) {
        // Criar o usuário admin se ele não existir
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: DEFAULT_ADMIN_EMAIL,
          password: DEFAULT_ADMIN_PASSWORD,
        });

        if (signUpError) {
          console.error("Erro ao criar usuário admin:", signUpError);
          return;
        }

        console.log("Usuário admin criado com sucesso");
      } else {
        console.log("Usuário admin já existe");
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
          
          toast.success("Login realizado com sucesso");
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
          toast.info("Sessão finalizada");
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

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/configure`
        }
      });

      if (error) {
        toast.error("Erro ao fazer login com Google", {
          description: error.message
        });
      }
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      toast.error("Ocorreu um erro durante o login com Google");
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
      loginWithGoogle, 
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
