
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { createAdminUser, isUserAdmin } from "@/utils/authUtils";

/**
 * Hook for managing authentication state with improved session persistence
 */
export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  // Initialize session and set up auth listeners with deadlock prevention
  useEffect(() => {
    setLoading(true);
    
    // 1. Set up the auth listener first before checking current session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, sessionData) => {
        console.log("Auth state changed:", event, sessionData?.user?.email);
        
        // Only use synchronous state updates in the callback
        setSession(sessionData);
        setUser(sessionData?.user || null);
        setIsAuthenticated(!!sessionData?.user);
        
        // Prevent deadlocks by deferring complex operations
        if (sessionData?.user) {
          // Use setTimeout to defer operations that might call Supabase again
          setTimeout(() => {
            const userIsAdmin = isUserAdmin(sessionData.user);
            setIsAdmin(userIsAdmin);
            console.log("Auth state processed:", sessionData.user.email, "isAdmin:", userIsAdmin);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
        }
      }
    );

    // 2. Then check for existing session
    const checkSession = async () => {
      try {
        // Check if there's an active session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setLoading(false);
          return;
        }
        
        if (currentSession) {
          console.log("Session retrieved:", currentSession.user.email);
          
          // Explicitly store the entire session, not just the user
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          
          // Check admin status
          const userIsAdmin = isUserAdmin(currentSession.user);
          setIsAdmin(userIsAdmin);
          
          console.log("Session restored. User:", currentSession.user.email, "isAdmin:", userIsAdmin);
        } else {
          console.log("No active session found");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
        setIsSupabaseReady(true);
      }
    };

    // Try to create admin user
    createAdminUser();
    
    // Execute session check
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    isAuthenticated,
    isAdmin,
    user,
    session,  // Expose the entire session object
    loading,
    isSupabaseReady
  };
}
