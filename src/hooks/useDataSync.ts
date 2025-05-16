
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const checkForUpdates = () => {
    const lastUpdateStr = localStorage.getItem(LAST_UPDATE_KEY);
    
    if (!lastUpdateStr) {
      return false;
    }
    
    try {
      const lastStoredUpdate = JSON.parse(lastUpdateStr);
      const storedTime = new Date(lastStoredUpdate.timestamp);
      
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
  const notifyDataChange = (type: string, details: string, initiator = 'system') => {
    // Salvar timestamp da atualização
    const updateInfo = {
      timestamp: new Date().toISOString(),
      type,
      details,
      initiator
    };
    
    localStorage.setItem(LAST_UPDATE_KEY, JSON.stringify(updateInfo));
    
    // Se for admin, apenas registra a mudança mas não notifica
    if (isAdmin) {
      console.log("Mudança de dados registrada:", updateInfo);
      return;
    }
    
    // Se não for admin, notifica sobre a mudança
    toast.info("Dados atualizados", {
      description: `O administrador realizou alterações: ${details}`,
      duration: 5000
    });
    
    // Marca que existem atualizações disponíveis
    setHasUpdates(true);
  };
  
  // Registra uma atualização feita pelo admin
  const registerAdminChange = (type: string, details: string) => {
    if (!isAdmin) return; // Apenas admin pode registrar mudanças
    
    notifyDataChange(type, details, 'admin');
    
    // Atualiza o tempo local de sincronização para o admin
    setLastSyncTime(new Date());
  };
  
  // Sincronizar com as últimas atualizações
  const syncWithLatestData = () => {
    const lastUpdateStr = localStorage.getItem(LAST_UPDATE_KEY);
    
    if (lastUpdateStr) {
      try {
        const lastStoredUpdate = JSON.parse(lastUpdateStr);
        setLastSyncTime(new Date(lastStoredUpdate.timestamp));
        setHasUpdates(false);
        
        return true;
      } catch (error) {
        console.error("Erro ao sincronizar com os dados mais recentes:", error);
      }
    }
    
    return false;
  };

  // Verificar periodicamente por mudanças (apenas para usuários não-admin)
  useEffect(() => {
    if (isAdmin) {
      // Admins não precisam verificar - eles são os que fazem as mudanças
      return;
    }
    
    const intervalId = setInterval(() => {
      const hasNewUpdates = checkForUpdates();
      
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
    const lastUpdateStr = localStorage.getItem(LAST_UPDATE_KEY);
    
    if (lastUpdateStr) {
      try {
        const lastStoredUpdate = JSON.parse(lastUpdateStr);
        setLastSyncTime(new Date(lastStoredUpdate.timestamp));
      } catch (error) {
        // Se houver erro, inicializa com o tempo atual
        setLastSyncTime(new Date());
      }
    } else {
      // Se não houver registro anterior, inicializa com o tempo atual
      setLastSyncTime(new Date());
    }
  }, []);

  return {
    lastSyncTime,
    hasUpdates,
    registerAdminChange,
    syncWithLatestData,
    notifyDataChange
  };
}
