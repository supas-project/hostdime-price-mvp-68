
import { useCallback } from "react";
import { authRepository } from "@/services/auth/AuthRepository";
import { AuthActions } from "@/types/auth-interfaces";
import { toast } from "sonner";

/**
 * Centralized auth actions
 * Provides consistent interface for auth operations
 */
export function useAuthActions(): AuthActions {
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 AuthActions: Attempting login with:", email);
      return await authRepository.login(email, password);
    } catch (error) {
      console.error("❌ AuthActions: Login error:", error);
      toast.error("Erro interno de autenticação");
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log("🚪 AuthActions: Starting logout process");
      await authRepository.logout();
    } catch (error) {
      console.error("❌ AuthActions: Logout error:", error);
      toast.error("Erro ao fazer logout");
      throw error;
    }
  }, []);

  return {
    login,
    logout
  };
}
