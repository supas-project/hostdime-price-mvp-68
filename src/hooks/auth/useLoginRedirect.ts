
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
 * Hook para gerenciar redirecionamento após login
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
    console.log("Login redirect check - Auth state:", { 
      isAuthenticated, 
      loading, 
      isSupabaseReady,
      userEmail: user?.email 
    });
    
    if (isSupabaseReady && isAuthenticated && !loading && user) {
      console.log("Usuário autenticado, redirecionando...");
      
      // If admin, redirect to price table
      const isAdminEmail = user.email === "admin@hostdime.com.br";
      const redirectTo = isAdminEmail ? "/price-table" : "/configure";
      
      // Use the from if it exists, otherwise use the default redirectTo
      const from = location.state && (location.state as any).from?.pathname 
        ? (location.state as any).from?.pathname 
        : redirectTo;
      
      console.log("Redirecionando para:", from);
      
      // Use timeout to ensure state updates are completed
      setTimeout(() => {
        navigate(from, {
          replace: true
        });
      }, 100);
    }
  }, [isAuthenticated, loading, user, navigate, location.state, isSupabaseReady]);
}
