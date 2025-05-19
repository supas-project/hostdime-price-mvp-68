
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { createAdminUser, isUserAdmin } from "@/utils/authUtils";

/**
 * Hook for managing authentication state
 */
export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session and set up auth listeners
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Check if there's an active session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setLoading(false);
          return;
        }
        
        if (session) {
          console.log("Session retrieved from Supabase:", session.user.email);
          setIsAuthenticated(true);
          setUser(session.user);
          
          // Check admin status
          const userIsAdmin = isUserAdmin(session.user);
          setIsAdmin(userIsAdmin);
          
          console.log("Session restored. User:", session.user.email, "isAdmin:", userIsAdmin);
        } else {
          console.log("No session found");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Try to create admin user
    createAdminUser();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          setUser(session.user);
          
          // Check admin status
          const userIsAdmin = isUserAdmin(session.user);
          setIsAdmin(userIsAdmin);
          
          console.log("Sign In:", session.user.email, "isAdmin:", userIsAdmin);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Update session when token is refreshed
          console.log("Token refreshed for:", session.user.email);
          const userIsAdmin = isUserAdmin(session.user);
          setIsAdmin(userIsAdmin);
          setUser(session.user);
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return {
    isAuthenticated,
    isAdmin,
    user,
    loading
  };
}
