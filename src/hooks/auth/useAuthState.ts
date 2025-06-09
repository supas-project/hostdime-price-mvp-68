
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { authService } from "@/services/auth-service-refactored";

/**
 * Hook para gerenciar o estado de autenticação
 */
export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  useEffect(() => {
    console.log("🔄 Initializing auth state hook");
    
    let mounted = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = authService.onAuthStateChange(
      (event, currentSession) => {
        console.log("🔄 Auth state changed:", event, currentSession?.user?.email);
        
        if (!mounted) return;
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          setIsAdmin(authService.isAdmin(currentSession.user));
        } else if (event === 'SIGNED_OUT') {
          console.log("🚪 User signed out");
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
          setSession(null);
        }
      }
    );

    // Then check for existing session
    async function initializeAuth() {
      try {
        console.log("🔍 Checking existing session");
        const { user: currentUser, session: currentSession } = await authService.getCurrentSession();
        
        if (!mounted) return;
        
        if (currentSession && currentUser) {
          console.log("✅ Session found:", currentUser.email);
          setSession(currentSession);
          setUser(currentUser);
          setIsAuthenticated(true);
          setIsAdmin(authService.isAdmin(currentUser));
        } else {
          console.log("ℹ️ No active session found");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
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
  }, []);

  return {
    isAuthenticated,
    isAdmin,
    user,
    session,
    loading,
    isSupabaseReady
  };
}
