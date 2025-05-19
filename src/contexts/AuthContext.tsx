
import React, { createContext, useContext, ReactNode, useState } from "react";
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, user, session, loading, isSupabaseReady } = useAuthState();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Enhanced login function with comprehensive error handling
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const success = await authService.login(email, password);
      return success;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro ao fazer login", {
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
      return false;
    }
  };

  // Enhanced logout function with improved state tracking
  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erro ao fazer logout", {
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
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
