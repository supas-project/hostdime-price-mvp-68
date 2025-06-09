
import React, { createContext, useContext, ReactNode } from "react";
import { UnifiedAuthContext as AuthContextType } from "@/hooks/auth/useUnifiedAuth";
import { useUnifiedAuth } from "@/hooks/auth/useUnifiedAuth";

const UnifiedAuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Unified AuthProvider - single source of truth for auth context
 * Replaces all fragmented auth providers
 */
export function UnifiedAuthProvider({ children }: { children: ReactNode }) {
  const authState = useUnifiedAuth();
  
  return (
    <UnifiedAuthContext.Provider value={authState}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within a UnifiedAuthProvider");
  }
  return context;
};

// Export unified hook for backward compatibility
export const useAuth = useAuthContext;
