
import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface UnifiedAuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSupabaseReady: boolean;
}

interface UnifiedAuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export interface UnifiedAuthContext extends UnifiedAuthState, UnifiedAuthActions {}

/**
 * Unified auth hook - single source of truth for authentication
 * Replaces all fragmented auth hooks with one consistent implementation
 */
export function useUnifiedAuth(): UnifiedAuthContext {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  // Centralized admin check
  const checkIsAdmin = useCallback((user: User | null): boolean => {
    return user?.email === "admin@hostdime.com.br";
  }, []);

  // Auth state change handler
  const handleAuthStateChange = useCallback((event: string, currentSession: Session | null) => {
    console.log("🔄 UnifiedAuth: Auth state changed:", event, currentSession?.user?.email);
    
    if (currentSession) {
      setSession(currentSession);
      setUser(currentSession.user);
      setIsAuthenticated(true);
      setIsAdmin(checkIsAdmin(currentSession.user));
    } else if (event === 'SIGNED_OUT') {
      console.log("🚪 UnifiedAuth: User signed out");
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      setSession(null);
    }
  }, [checkIsAdmin]);

  // Login action
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 UnifiedAuth: Attempting login:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error("❌ UnifiedAuth: Login error:", error.message);
        toast.error("Erro ao fazer login", {
          description: error.message.includes("Invalid login credentials") 
            ? "Email ou senha incorretos" 
            : error.message
        });
        return false;
      }

      if (data?.user) {
        console.log("✅ UnifiedAuth: Login successful:", data.user.email);
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ UnifiedAuth: Login error:", error);
      toast.error("Erro interno de autenticação");
      return false;
    }
  }, []);

  // Logout action
  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log("🚪 UnifiedAuth: Starting logout");
      
      localStorage.removeItem('hostdime_auth');
      
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) {
        console.error("❌ UnifiedAuth: Logout error:", error);
        throw error;
      }
      
      console.log("✅ UnifiedAuth: Logout successful");
      toast.success("Logout realizado com sucesso");
      
    } catch (error) {
      console.error("❌ UnifiedAuth: Logout failed:", error);
      throw error;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    console.log("🔄 UnifiedAuth: Initializing");
    
    let mounted = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        handleAuthStateChange(event, currentSession);
      }
    );

    // Then check for existing session
    async function initializeAuth() {
      try {
        console.log("🔍 UnifiedAuth: Checking existing session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error("❌ UnifiedAuth: Session error:", error);
        } else if (session && session.user) {
          console.log("✅ UnifiedAuth: Session found:", session.user.email);
          setSession(session);
          setUser(session.user);
          setIsAuthenticated(true);
          setIsAdmin(checkIsAdmin(session.user));
        } else {
          console.log("ℹ️ UnifiedAuth: No active session found");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("❌ UnifiedAuth: Initialization error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
          setIsSupabaseReady(true);
        }
      }
    }
    
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, checkIsAdmin]);

  return {
    isAuthenticated,
    isAdmin,
    user,
    session,
    loading,
    isSupabaseReady,
    login,
    logout
  };
}
