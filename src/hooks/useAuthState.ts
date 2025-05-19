
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { isUserAdmin, createAdminUser } from "@/utils/authUtils";

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

  // Initialize session and set up auth listeners with improved ordering
  useEffect(() => {
    console.log("Inicializando hook de autenticação");
    
    // 1. Set up the auth listener FIRST to catch immediate auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Estado de autenticação alterado:", event, currentSession?.user?.email);
        
        if (currentSession) {
          // Update state SYNCHRONOUSLY to prevent race conditions
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          
          const userIsAdmin = isUserAdmin(currentSession.user);
          setIsAdmin(userIsAdmin);
          console.log("Sessão processada:", currentSession.user.email, "isAdmin:", userIsAdmin);
        } else if (event === 'SIGNED_OUT') {
          console.log("Usuário deslogado");
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
          setSession(null);
        }
      }
    );

    // 2. THEN check for existing session
    const checkSession = async () => {
      try {
        console.log("Verificando sessão existente...");
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          setLoading(false);
          setIsSupabaseReady(true);
          return;
        }
        
        if (existingSession) {
          console.log("Sessão recuperada:", existingSession.user.email);
          
          setSession(existingSession);
          setUser(existingSession.user);
          setIsAuthenticated(true);
          
          const userIsAdmin = isUserAdmin(existingSession.user);
          setIsAdmin(userIsAdmin);
          
          console.log("Sessão restaurada. Usuário:", existingSession.user.email, "isAdmin:", userIsAdmin);
        } else {
          console.log("Nenhuma sessão ativa encontrada");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setLoading(false);
        setIsSupabaseReady(true);
      }
    };

    // Try to create admin user for system initialization
    createAdminUser();
    
    // Execute session check
    checkSession();

    // Cleanup subscription on unmount
    return () => {
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
