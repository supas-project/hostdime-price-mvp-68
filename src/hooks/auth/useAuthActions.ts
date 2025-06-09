
import { useCallback } from "react";
import { authService } from "@/services/auth-service-refactored";
import { toast } from "sonner";

/**
 * Hook para ações de autenticação (login/logout)
 */
export function useAuthActions() {
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 Attempting login with:", email);
      return await authService.login(email, password);
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error("Erro interno de autenticação");
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log("🚪 Starting logout process");
      await authService.logout();
    } catch (error) {
      console.error("❌ Logout error:", error);
      toast.error("Erro ao fazer logout");
      throw error;
    }
  }, []);

  return {
    login,
    logout
  };
}
