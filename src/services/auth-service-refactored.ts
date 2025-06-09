
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

/**
 * Unified Authentication Service
 * Replaces multiple auth services with a single, clean interface
 */
export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

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

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<{ user: User | null; session: Session | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("❌ Session error:", error);
        return { user: null, session: null };
      }
      
      return { 
        user: session?.user || null, 
        session 
      };
    } catch (error) {
      console.error("❌ Get session error:", error);
      return { user: null, session: null };
    }
  }

  /**
   * Check if user is admin
   */
  isAdmin(user: User | null): boolean {
    return user?.email === "admin@hostdime.com.br";
  }

  /**
   * Create admin user if it doesn't exist
   */
  async createAdminUser(): Promise<void> {
    try {
      console.log("👤 Checking admin user existence");
      
      // Try to sign in to check if admin exists
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: "admin@hostdime.com.br",
        password: "H0stD1m3@2025",
      });

      // If login fails with invalid credentials, user doesn't exist
      if (signInError && signInError.message === 'Invalid login credentials') {
        console.log("👤 Creating admin user");
        
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
          console.error("❌ Error creating admin:", signUpError);
          return;
        }

        if (data?.user) {
          console.log("✅ Admin user created successfully");
        }
      } else if (!signInError) {
        console.log("✅ Admin user already exists");
      }
      
      // Always sign out after checking/creating
      await supabase.auth.signOut();
      
    } catch (error) {
      console.error("❌ Error in admin creation:", error);
    }
  }

  /**
   * Set up auth state listener
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
