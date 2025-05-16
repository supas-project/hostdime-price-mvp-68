
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  isSupabaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constantes para o usuário admin padrão - agora com verificação precisa
const ADMIN_EMAIL = "admin@hostdime.com.br";
const DEFAULT_ADMIN_PASSWORD = "H0stD1m3@2025";

// Chave para armazenar sessões no localStorage com identificador único
const SESSION_STORAGE_KEY_PREFIX = 'hostdime_auth_session_';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Gerar um ID de sessão único para este navegador/janela
  const [sessionId] = useState(() => {
    const existingId = localStorage.getItem('current_browser_session_id');
    if (existingId) return existingId;
    
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('current_browser_session_id', newId);
    return newId;
  });

  // Chave de sessão específica para esta janela/aba do navegador
  const currentSessionKey = `${SESSION_STORAGE_KEY_PREFIX}${sessionId}`;
  
  // Função para criar o usuário admin padrão
  const createAdminUser = async () => {
    try {
      // Tentar fazer login com o usuário admin para verificar se ele existe
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
      });

      // Se recebemos um erro que não seja de credenciais inválidas, registramos
      if (signInError && signInError.message !== 'Invalid login credentials') {
        console.log("Verificando se o usuário admin existe:", signInError);
      }

      // Se conseguimos fazer login, o usuário já existe
      if (signInData?.user) {
        console.log("Usuário admin já existe");
        
        // Fazer logout depois de verificar que o usuário existe
        await supabase.auth.signOut();
        return;
      }

      // Se não conseguimos fazer login, tentamos criar o usuário
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        options: {
          // Definir para não requerer confirmação de email, já que é um usuário padrão
          emailRedirectTo: window.location.origin,
          data: {
            is_admin: true
          }
        }
      });

      if (signUpError) {
        console.error("Erro ao criar usuário admin:", signUpError);
        return;
      }

      if (signUpData?.user) {
        console.log("Usuário admin criado com sucesso");
        
        // Se o usuário foi criado com sucesso, vamos tentar confirmar manualmente
        try {
          // Recuperar a sessão do usuário recém-criado
          if (signUpData.session) {
            console.log("Usuário admin confirmado automaticamente");
          }
        } catch (confirmError) {
          console.error("Erro ao confirmar email do admin:", confirmError);
        }
        
        // Fazer logout depois de criar o usuário
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Erro ao criar usuário admin:", error);
    }
  };

  // Salvar sessão específica para esta janela/aba
  const saveLocalSession = (session: Session | null, userInfo: User | null, isUserAdmin: boolean) => {
    if (session && userInfo) {
      const localSessionData = {
        session,
        user: userInfo,
        isAdmin: isUserAdmin,
        timestamp: Date.now()
      };
      
      localStorage.setItem(currentSessionKey, JSON.stringify(localSessionData));
      console.log(`Sessão salva para ${currentSessionKey}`);
      
      // Atualizar também o registro global de sessões ativas
      updateGlobalSessionRegistry(userInfo.id, true);
    } else {
      localStorage.removeItem(currentSessionKey);
      // Remover da lista global de sessões
      if (user) {
        updateGlobalSessionRegistry(user.id, false);
      }
    }
  };

  // Atualizar o registro global de sessões ativas
  const updateGlobalSessionRegistry = (userId: string, isActive: boolean) => {
    const registryKey = 'hostdime_active_sessions';
    const existingRegistry = localStorage.getItem(registryKey);
    let registry: Record<string, string[]> = existingRegistry ? JSON.parse(existingRegistry) : {};
    
    if (isActive) {
      // Adicionar esta sessão à lista de sessões ativas para este usuário
      if (!registry[userId]) {
        registry[userId] = [];
      }
      
      if (!registry[userId].includes(sessionId)) {
        registry[userId].push(sessionId);
      }
    } else {
      // Remover esta sessão da lista
      if (registry[userId]) {
        registry[userId] = registry[userId].filter(id => id !== sessionId);
        
        if (registry[userId].length === 0) {
          delete registry[userId];
        }
      }
    }
    
    localStorage.setItem(registryKey, JSON.stringify(registry));
  };

  // Recuperar sessão específica desta janela/aba
  const loadLocalSession = (): {
    session: Session | null,
    user: User | null,
    isAdmin: boolean
  } => {
    const localSessionData = localStorage.getItem(currentSessionKey);
    if (localSessionData) {
      try {
        const { session, user, isAdmin } = JSON.parse(localSessionData);
        
        // Verificar se a sessão expirou
        const expiresAt = new Date((session?.expires_at || 0) * 1000);
        if (expiresAt > new Date()) {
          return { session, user, isAdmin };
        }
      } catch (err) {
        console.error("Erro ao carregar sessão local:", err);
      }
    }
    
    return { session: null, user: null, isAdmin: false };
  };

  // Check for existing session on initial load
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Primeiro, verificamos se há uma sessão local salva para esta janela/aba
        const localData = loadLocalSession();
        
        if (localData.session && localData.user) {
          setIsAuthenticated(true);
          setUser(localData.user);
          setIsAdmin(localData.user.email === ADMIN_EMAIL); // Restringe admin somente para admin@hostdime.com.br
          setLoading(false);
          return;
        }
        
        // Se não houver sessão local, verificamos a sessão do Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          setLoading(false);
          return;
        }
        
        if (session) {
          setIsAuthenticated(true);
          setUser(session.user);
          
          // Verifica se o usuário é admin - AGORA ESTRITAMENTE APENAS admin@hostdime.com.br
          const isUserAdmin = session.user.email === ADMIN_EMAIL;
          setIsAdmin(isUserAdmin);
          
          // Salvar a sessão localmente para esta janela/aba
          saveLocalSession(session, session.user, isUserAdmin);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setLoading(false);
      }
    };

    checkSession();

    // Tenta criar o usuário admin
    createAdminUser();
    
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email, "Session ID:", sessionId);
        
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          setUser(session.user);
          
          // Verifica se é admin - AGORA ESTRITAMENTE APENAS admin@hostdime.com.br
          const isUserAdmin = session.user.email === ADMIN_EMAIL;
          setIsAdmin(isUserAdmin);
          
          // Salvar a sessão localmente para esta janela/aba
          saveLocalSession(session, session.user, isUserAdmin);
        } else if (event === 'SIGNED_OUT') {
          // Para evitar deslogamento cruzado entre abas, só limpa os estados se
          // o evento SIGNED_OUT for para a sessão atual
          const localData = loadLocalSession();
          
          if (!localData.session || localData.user?.id === session?.user?.id || !session) {
            setIsAuthenticated(false);
            setIsAdmin(false);
            setUser(null);
            localStorage.removeItem(currentSessionKey);
          }
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error("Erro ao fazer login", {
          description: error.message
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Ocorreu um erro durante o login");
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Primeiramente, limpar os estados locais para garantir uma resposta rápida na UI
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      
      // Remover apenas a sessão atual sem afetar outras sessões
      localStorage.removeItem(currentSessionKey);
      
      // Atualizar o registro global de sessões
      if (user) {
        updateGlobalSessionRegistry(user.id, false);
      }
      
      // Agora vamos fazer o logout no Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Apenas desloga a sessão atual, não todas as sessões
      });
      
      if (error) {
        console.error("Erro ao fazer logout no Supabase:", error);
        return;
      }
      
      toast.success("Logout realizado com sucesso");
      
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, não exibimos mensagem para o usuário pois já limpamos a sessão local
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAdmin, 
      user, 
      login, 
      logout, 
      loading,
      isSupabaseReady: true 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
