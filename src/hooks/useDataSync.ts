
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

// Chave para armazenar a última atualização
const LAST_UPDATE_KEY = 'price_data_last_update';

// Intervalo de verificação de atualizações (em ms)
const CHECK_INTERVAL = 10000; // 10 segundos

export function useDataSync() {
  const { isAdmin } = useAuth();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [hasUpdates, setHasUpdates] = useState(false);
  const { toast } = useToast();

  // Verificar se há atualizações disponíveis
  const checkForUpdates = async () => {
    try {
      // Buscar a última atualização do banco de dados
      const { data, error } = await supabase
        .from('price_data_updates')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        console.error("Erro ao verificar atualizações:", error);
        return false;
      }
      
      if (!data) return false;
      
      const storedTime = new Date(data.updated_at);
      
      // Verificar se a última atualização é mais recente que o último sync
      if (lastSyncTime && storedTime > lastSyncTime) {
        return true;
      }
    } catch (error) {
      console.error("Erro ao verificar atualizações:", error);
    }
    
    return false;
  };

  // Notificar sobre uma mudança nos dados
  const notifyDataChange = async (type: string, details: string, initiator = 'system') => {
    try {
      // Registrar atualização no banco de dados
      const timestamp = new Date().toISOString();
      
      const { error } = await supabase
        .from('price_data_updates')
        .insert([
          { 
            type,
            details,
            initiator,
            updated_at: timestamp
          }
        ]);
        
      if (error) {
        console.error("Erro ao registrar atualização:", error);
      }
      
      // Se for admin, apenas registra a mudança mas não notifica
      if (isAdmin) {
        console.log("Mudança de dados registrada:", { type, details, timestamp });
        return;
      }
      
      // Se não for admin, notifica sobre a mudança
      toast.info("Dados atualizados", {
        description: `O administrador realizou alterações: ${details}`,
        duration: 5000
      });
      
      // Marca que existem atualizações disponíveis
      setHasUpdates(true);
    } catch (error) {
      console.error("Erro ao notificar mudança de dados:", error);
    }
  };
  
  // Registra uma atualização feita pelo admin
  const registerAdminChange = async (type: string, details: string) => {
    if (!isAdmin) return; // Apenas admin pode registrar mudanças
    
    await notifyDataChange(type, details, 'admin');
    
    // Atualiza o tempo local de sincronização para o admin
    setLastSyncTime(new Date());
  };
  
  // Sincronizar com as últimas atualizações
  const syncWithLatestData = async () => {
    try {
      const { data, error } = await supabase
        .from('price_data_updates')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error("Erro ao buscar última atualização:", error);
        return false;
      }
      
      if (data) {
        setLastSyncTime(new Date(data.updated_at));
        setHasUpdates(false);
        return true;
      }
    } catch (error) {
      console.error("Erro ao sincronizar com os dados mais recentes:", error);
    }
    
    return false;
  };

  // Verificar periodicamente por mudanças (apenas para usuários não-admin)
  useEffect(() => {
    if (isAdmin) {
      // Admins não precisam verificar - eles são os que fazem as mudanças
      return;
    }
    
    const intervalId = setInterval(async () => {
      const hasNewUpdates = await checkForUpdates();
      
      if (hasNewUpdates && !hasUpdates) {
        setHasUpdates(true);
        
        toast.info("Atualizações disponíveis", {
          description: "O administrador realizou alterações. Clique para atualizar.",
          duration: 0 // Não expira automaticamente
        });
      }
    }, CHECK_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [isAdmin, hasUpdates, lastSyncTime]);

  // Inicializar o tempo de sincronização
  useEffect(() => {
    const initSyncTime = async () => {
      try {
        const { data, error } = await supabase
          .from('price_data_updates')
          .select('updated_at')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data) {
          setLastSyncTime(new Date(data.updated_at));
        } else {
          // Se não houver registro anterior, inicializa com o tempo atual
          setLastSyncTime(new Date());
        }
      } catch (error) {
        // Em caso de erro, inicializa com o tempo atual
        console.error("Erro ao inicializar tempo de sincronização:", error);
        setLastSyncTime(new Date());
      }
    };
    
    initSyncTime();
  }, []);

  return {
    lastSyncTime,
    hasUpdates,
    registerAdminChange,
    syncWithLatestData,
    notifyDataChange
  };
}
