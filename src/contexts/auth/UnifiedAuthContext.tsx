
import React, { createContext, useContext, ReactNode } from "react";
import { useUnifiedAuth } from "@/hooks/auth/useUnifiedAuth";

// Define the context type based on the unified auth hook
type UnifiedAuthContextType = ReturnType<typeof useUnifiedAuth>;

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

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
