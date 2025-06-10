import React, { createContext, useContext, ReactNode, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/utils/authUtils";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  isSupabaseReady: boolean;
}

// Valor padrão que implementa completamente a interface
const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  session: null,
  login: async () => false,
  logout: async () => {},
  loading: false,
  isSupabaseReady: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { 
    isAuthenticated, 
    isAdmin, 
    user, 
    session, 
    loading, 
    isSupabaseReady 
  } = useAuthState();
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Enhanced login function with comprehensive error handling
  const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Tentando login com", email);
      const success = await authService.login(email, password);
      
      if (success) {
        console.log("Login bem sucedido");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro ao fazer login", {
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
      return false;
    }
  }, []);

  // Enhanced logout function with improved state tracking
  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      setIsLoggingOut(true);
      console.log("Iniciando logout...");
      await authService.logout();
      console.log("Logout completo");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erro ao fazer logout", {
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, []);
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAdmin, 
      user, 
      session,
      login: handleLogin,
      logout: handleLogout,
      loading,
      isSupabaseReady
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
