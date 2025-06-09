
import { useState, useCallback } from 'react';
import { DataSynchronizationService } from '@/services/data-synchronization-service';
import { toast } from '@/utils/toast-utils';

export function useDataSynchronization() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const synchronizeData = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      console.log('[useDataSynchronization] Starting unified data synchronization...');
      
      // Check consistency first
      const consistency = await DataSynchronizationService.checkDataConsistency();
      
      console.log('[useDataSynchronization] Consistency check:', consistency);
      
      if (consistency.missingInPrice.length === 0 && 
          consistency.extraInPrice.length === 0 && 
          Object.keys(consistency.itemMismatches).length === 0) {
        toast.success('Dados já sincronizados', {
          description: 'Configuração e tabela de preços estão em sincronia'
        });
        setLastSyncTime(new Date());
        return true;
      }
      
      // Perform synchronization using the correct method
      const success = await DataSynchronizationService.synchronizeAllData();
      
      if (success) {
        setLastSyncTime(new Date());
        toast.success('Sincronização concluída', {
          description: 'Dados unificados sincronizados com sucesso'
        });
      }
      
      return success;
    } catch (error) {
      console.error('[useDataSynchronization] Synchronization error:', error);
      toast.error('Erro na sincronização', {
        description: 'Falha ao sincronizar dados unificados'
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);
  
  const checkConsistency = useCallback(async () => {
    try {
      return await DataSynchronizationService.checkDataConsistency();
    } catch (error) {
      console.error('[useDataSynchronization] Error checking consistency:', error);
      return {
        missingInPrice: [],
        extraInPrice: [],
        itemMismatches: {}
      };
    }
  }, []);
  
  return {
    isSyncing,
    lastSyncTime,
    synchronizeData,
    checkConsistency
  };
}
