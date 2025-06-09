
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { AuthProvider } from "@/types/auth-interfaces";
import { toast } from "sonner";

/**
 * Repository pattern implementation for authentication
 * Abstracts Supabase details and provides clean interface
 */
export class AuthRepository implements AuthProvider {
  private static instance: AuthRepository;

  static getInstance(): AuthRepository {
    if (!AuthRepository.instance) {
      AuthRepository.instance = new AuthRepository();
    }
    return AuthRepository.instance;
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log("🔐 Repository: Attempting login:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error("❌ Repository: Auth error:", error.message);
        toast.error("Erro ao fazer login", {
          description: error.message.includes("Invalid login credentials") 
            ? "Email ou senha incorretos" 
            : error.message
        });
        return false;
      }

      if (data?.user) {
        console.log("✅ Repository: Login successful:", data.user.email);
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Repository: Login error:", error);
      toast.error("Erro interno de autenticação");
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log("🚪 Repository: Starting logout");
      
      localStorage.removeItem('hostdime_auth');
      
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) {
        console.error("❌ Repository: Logout error:", error);
        throw error;
      }
      
      console.log("✅ Repository: Logout successful");
      toast.success("Logout realizado com sucesso");
      
    } catch (error) {
      console.error("❌ Repository: Logout failed:", error);
      throw error;
    }
  }

  async getCurrentSession(): Promise<{ user: User | null; session: Session | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("❌ Repository: Session error:", error);
        return { user: null, session: null };
      }
      
      return { 
        user: session?.user || null, 
        session 
      };
    } catch (error) {
      console.error("❌ Repository: Get session error:", error);
      return { user: null, session: null };
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  isAdmin(user: User | null): boolean {
    return user?.email === "admin@hostdime.com.br";
  }

  async createAdminUser(): Promise<void> {
    try {
      console.log("👤 Repository: Checking admin user existence");
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: "admin@hostdime.com.br",
        password: "H0stD1m3@2025",
      });

      if (signInError && signInError.message === 'Invalid login credentials') {
        console.log("👤 Repository: Creating admin user");
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: "admin@hostdime.com.br",
          password: "H0stD1m3@2025",
          options: {
            data: {
              is_admin: true
            }
          }
        });

        if (signUpError) {
          console.error("❌ Repository: Error creating admin:", signUpError);
          return;
        }

        if (data?.user) {
          console.log("✅ Repository: Admin user created successfully");
        }
      } else if (!signInError) {
        console.log("✅ Repository: Admin user already exists");
      }
      
      await supabase.auth.signOut();
      
    } catch (error) {
      console.error("❌ Repository: Error in admin creation:", error);
    }
  }
}

export const authRepository = AuthRepository.getInstance();
