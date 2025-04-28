
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load auth state from localStorage on initial render
  useEffect(() => {
    const authState = localStorage.getItem("authState");
    if (authState) {
      const { isAuthenticated, isAdmin } = JSON.parse(authState);
      setIsAuthenticated(isAuthenticated);
      setIsAdmin(isAdmin);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // For demonstration, using hardcoded admin credentials
    if (username === "admin" && password === "H0stD1m3@2025") {
      setIsAuthenticated(true);
      setIsAdmin(true);
      
      // Save to localStorage
      localStorage.setItem("authState", JSON.stringify({
        isAuthenticated: true,
        isAdmin: true
      }));
      
      toast.success("Login realizado com sucesso");
      return true;
    }
    
    toast.error("Credenciais inválidas");
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem("authState");
    toast.info("Sessão finalizada");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout }}>
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
