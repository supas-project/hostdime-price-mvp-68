
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "@supabase/supabase-js";

interface UseLoginRedirectProps {
  isAuthenticated: boolean;
  isSupabaseReady: boolean;
  loading: boolean;
  user: User | null;
}

/**
 * Centralized login redirect logic
 * Handles post-authentication navigation
 */
export function useLoginRedirect({ 
  isAuthenticated, 
  isSupabaseReady, 
  loading, 
  user 
}: UseLoginRedirectProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("🔄 LoginRedirect: Checking redirect conditions", { 
      isAuthenticated, 
      loading, 
      isSupabaseReady,
      userEmail: user?.email 
    });
    
    if (isSupabaseReady && isAuthenticated && !loading && user) {
      console.log("✅ LoginRedirect: User authenticated, redirecting...");
      
      // Determine redirect destination based on user role
      const isAdminUser = user.email === "admin@hostdime.com.br";
      const defaultRedirect = isAdminUser ? "/price-table" : "/configure";
      
      // Use saved location or default
      const from = location.state && (location.state as any).from?.pathname 
        ? (location.state as any).from?.pathname 
        : defaultRedirect;
      
      console.log("🔄 LoginRedirect: Redirecting to:", from);
      
      // Timeout ensures state updates are completed
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, loading, user, navigate, location.state, isSupabaseReady]);
}
