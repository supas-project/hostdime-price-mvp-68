
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { authRepository } from "@/services/auth/AuthRepository";
import { AuthState } from "@/types/auth-interfaces";

/**
 * Centralized auth state management
 * Single source of truth for authentication state
 */
export function useAuthState(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  useEffect(() => {
    console.log("🔄 AuthState: Initializing");
    
    let mounted = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = authRepository.onAuthStateChange(
      (event, currentSession) => {
        console.log("🔄 AuthState: Auth changed:", event, currentSession?.user?.email);
        
        if (!mounted) return;
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          setIsAdmin(authRepository.isAdmin(currentSession.user));
        } else if (event === 'SIGNED_OUT') {
          console.log("🚪 AuthState: User signed out");
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
        console.log("🔍 AuthState: Checking existing session");
        const { user: currentUser, session: currentSession } = await authRepository.getCurrentSession();
        
        if (!mounted) return;
        
        if (currentSession && currentUser) {
          console.log("✅ AuthState: Session found:", currentUser.email);
          setSession(currentSession);
          setUser(currentUser);
          setIsAuthenticated(true);
          setIsAdmin(authRepository.isAdmin(currentUser));
        } else {
          console.log("ℹ️ AuthState: No active session found");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("❌ AuthState: Initialization error:", error);
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
