import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';

// Tipagem para usuário presente no canal
interface PresentUser {
  user: string;
  joined_at: string;
}

// Define o tipo de dados que o contexto irá fornecer
interface RealtimePresenceContextType {
  presentUsers: PresentUser[];
  isLocked: boolean;
  lockedBy: string | null;
}

// Valor padrão do contexto
const defaultRealtimePresenceContext: RealtimePresenceContextType = {
  presentUsers: [],
  isLocked: false,
  lockedBy: null,
};

// Cria o contexto com um valor padrão seguro
const RealtimePresenceContext = createContext<RealtimePresenceContextType>(defaultRealtimePresenceContext);

// O Provedor que irá envolver nossa aplicação ou página
export const RealtimePresenceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); // Pega o usuário autenticado
  const [presentUsers, setPresentUsers] = useState<PresentUser[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const setupChannel = useCallback(() => {
    if (!user?.email) return;

    const newChannel = supabase.channel('price-table-editors', {
      config: {
        presence: {
          key: user.email, // Identifica o usuário pelo email
        },
      },
    });

    newChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = newChannel.presenceState();
        const users: PresentUser[] = [];
        
        Object.keys(presenceState).forEach(key => {
          const presences = presenceState[key];
          if (presences && presences.length > 0) {
            const presence = presences[0] as any;
            if (presence?.user && presence?.joined_at) {
              users.push({
                user: presence.user,
                joined_at: presence.joined_at,
              });
            }
          }
        });
        
        setPresentUsers(users);
        console.log('Price table editors presence synced:', users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined price table editing:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left price table editing:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await newChannel.track({ 
            user: user.email, 
            joined_at: new Date().toISOString() 
          });
          console.log('Subscribed to price-table-editors channel');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Error connecting to price-table-editors channel:', status);
        }
      });
    
    setChannel(newChannel);

  }, [user?.email]);

  useEffect(() => {
    setupChannel();
    return () => {
      if (channel) {
        console.log('Removing price-table-editors channel');
        supabase.removeChannel(channel);
      }
    };
  }, [user?.email, setupChannel]);

  // Lógica principal de bloqueio
  useEffect(() => {
    if (!user?.email || presentUsers.length <= 1) {
      setIsLocked(false);
      setLockedBy(null);
      return;
    }

    // Encontra o usuário que entrou primeiro
    const sortedUsers = [...presentUsers].sort((a, b) => 
      new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
    );
    
    const firstUser = sortedUsers[0];

    if (firstUser && firstUser.user !== user.email) {
      setIsLocked(true);
      setLockedBy(firstUser.user);
      console.log(`Price table locked by: ${firstUser.user}`);
    } else {
      setIsLocked(false);
      setLockedBy(null);
      console.log('Price table unlocked - current user is first');
    }
  }, [presentUsers, user?.email]);

  // Cleanup ao desmontar
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (channel) {
        channel.untrack();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (channel) {
        channel.untrack();
      }
    };
  }, [channel]);

  return (
    <RealtimePresenceContext.Provider value={{ presentUsers, isLocked, lockedBy }}>
      {children}
    </RealtimePresenceContext.Provider>
  );
};

// Hook customizado para consumir o contexto facilmente
export const useRealtimePresence = (): RealtimePresenceContextType => {
  const context = useContext(RealtimePresenceContext);
  if (context === undefined) {
    throw new Error('useRealtimePresence deve ser usado dentro de um RealtimePresenceProvider');
  }
  return context;
};

// Hook para verificar se a tabela está bloqueada
export const usePriceTableLock = () => {
  const { isLocked, lockedBy } = useRealtimePresence();
  return { isLocked, lockedBy };
};

// Hook para obter lista de editores presentes
export const usePresentEditors = () => {
  const { presentUsers } = useRealtimePresence();
  return presentUsers;
};

export type { RealtimePresenceContextType, PresentUser };
