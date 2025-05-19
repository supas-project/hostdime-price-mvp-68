
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

  // Initialize session and set up auth listeners with deadlock prevention
  useEffect(() => {
    console.log("Inicializando hook de autenticação");
    setLoading(true);
    
    // 1. Set up the auth listener first before checking current session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sessionData) => {
        console.log("Estado de autenticação alterado:", event, sessionData?.user?.email);
        
        if (sessionData) {
          // Ponto crítico: Atualizações de estado síncronas para evitar deadlocks
          setSession(sessionData);
          setUser(sessionData.user);
          setIsAuthenticated(true);
          
          // Verificação de admin é simples e pode ser realizada sem chamar Supabase novamente
          const userIsAdmin = isUserAdmin(sessionData.user);
          setIsAdmin(userIsAdmin);
          console.log("Sessão processada:", sessionData.user.email, "isAdmin:", userIsAdmin);
        } else if (event === 'SIGNED_OUT') {
          console.log("Usuário deslogado");
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
          setSession(null);
        }
      }
    );

    // 2. Check for existing session
    const checkSession = async () => {
      try {
        // Verificar se há uma sessão ativa
        console.log("Verificando sessão existente...");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          setLoading(false);
          return;
        }
        
        if (currentSession) {
          console.log("Sessão recuperada:", currentSession.user.email);
          
          // Armazenar explicitamente a sessão inteira, não apenas o usuário
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          
          // Verificação de admin
          const userIsAdmin = isUserAdmin(currentSession.user);
          setIsAdmin(userIsAdmin);
          
          console.log("Sessão restaurada. Usuário:", currentSession.user.email, "isAdmin:", userIsAdmin);
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
    session,  // Expose the entire session object
    loading,
    isSupabaseReady
  };
}
