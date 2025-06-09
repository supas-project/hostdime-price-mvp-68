
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

/**
 * Utilitários de autenticação
 */
export class AuthUtilsService {
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
}
