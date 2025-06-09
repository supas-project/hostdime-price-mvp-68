import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// Constants for the user admin
export const ADMIN_EMAIL = "admin@hostdime.com.br";
export const DEFAULT_ADMIN_PASSWORD = "H0stD1m3@2025";

// Function to create the default admin user
export const createAdminUser = async (): Promise<void> => {
  try {
    // Try to sign in with the admin user to check if it exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
    });

    // Handle sign-in error that isn't about invalid credentials
    if (signInError && signInError.message !== 'Invalid login credentials') {
      console.log("Checking if admin user exists:", signInError);
    }

    // If login succeeded, the user exists
    if (signInData?.user) {
      console.log("Admin user already exists");
      
      // Log out after verification
      await supabase.auth.signOut();
      return;
    }

    // Try to create the admin user if sign-in failed
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      options: {
        data: {
          is_admin: true
        }
      }
    });

    if (signUpError) {
      console.error("Error creating admin user:", signUpError);
      return;
    }

    if (signUpData?.user) {
      console.log("Admin user created successfully");
      
      // Handle automatic confirmation if there's a session
      if (signUpData.session) {
        console.log("Admin user confirmed automatically");
      }
      
      // Log out after creating the user
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

// Helper to check if user is admin
export const isUserAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.email === ADMIN_EMAIL;
};

// Authentication service functions with improved error handling
export const authService = {
  login: async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Tentando fazer login com:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Erro de autenticação:", error.message);
        toast.error("Erro ao fazer login", {
          description: error.message
        });
        return false;
      }
      
      if (data && data.user) {
        const isUserAdmin = data.user.email === ADMIN_EMAIL;
        console.log("Login bem-sucedido:", data.user.email, "isAdmin:", isUserAdmin);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Ocorreu um erro durante o login");
      return false;
    }
  },

  logout: async (): Promise<void> => {
    try {
      console.log("Iniciando processo de logout");
      
      // Force-clear local storage for auth before calling signOut
      localStorage.removeItem('hostdime_auth');
      
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Only sign out from this browser tab
      });
      
      if (error) {
        console.error("Erro ao fazer logout no Supabase:", error);
        throw error;
      }
      
      console.log("Logout realizado com sucesso");
      toast.success("Logout realizado com sucesso");
      
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  }
};
