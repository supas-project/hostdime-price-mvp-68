
import React, { createContext, useContext, ReactNode } from "react";
import { AuthContextType } from "@/types/auth-interfaces";
import { useAuth } from "@/hooks/auth/useAuth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Simplified AuthProvider using the unified useAuth hook
 * Single source of truth for auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const authState = useAuth();
  
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
