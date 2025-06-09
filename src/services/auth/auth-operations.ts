
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

/**
 * Serviço para operações de autenticação
 */
export class AuthOperationsService {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log("🔐 Attempting login:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error("❌ Auth error:", error.message);
        toast.error("Erro ao fazer login", {
          description: error.message.includes("Invalid login credentials") 
            ? "Email ou senha incorretos" 
            : error.message
        });
        return false;
      }

      if (data?.user) {
        console.log("✅ Login successful:", data.user.email);
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error("Erro interno de autenticação");
      return false;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      console.log("🚪 Starting logout process");
      
      // Clear local storage first
      localStorage.removeItem('hostdime_auth');
      
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) {
        console.error("❌ Logout error:", error);
        throw error;
      }
      
      console.log("✅ Logout successful");
      toast.success("Logout realizado com sucesso");
      
    } catch (error) {
      console.error("❌ Logout failed:", error);
      throw error;
    }
  }
}
