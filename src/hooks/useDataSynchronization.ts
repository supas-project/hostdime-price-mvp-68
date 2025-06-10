
import { useState, useCallback } from 'react';
import { UnifiedDataService } from '@/services/unified-data-service';
import { toast } from '@/utils/toast-utils';

export function useDataSynchronization() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const synchronizeData = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      console.log('[useDataSynchronization] Starting unified data synchronization...');
      
      // Check if data needs consolidation first
      const consolidationStatus = await UnifiedDataService.getConsolidationStatus();
      
      if (consolidationStatus.phase !== 'completed') {
        console.log('[useDataSynchronization] Data needs consolidation...');
        toast.info('Preparando dados', {
          description: 'Consolidando dados estáticos no sistema unificado...'
        });
        
        const consolidated = await UnifiedDataService.consolidateAllData();
        
        if (!consolidated) {
          toast.error('Erro na consolidação', {
            description: 'Falha ao consolidar dados estáticos'
          });
          return false;
        }
        
        toast.success('Dados consolidados', {
          description: 'Dados estáticos consolidados com sucesso'
        });
        
        setLastSyncTime(new Date());
        return true;
      }
      
      toast.success('Dados já sincronizados', {
        description: 'Sistema já está com dados consolidados'
      });
      setLastSyncTime(new Date());
      return true;
      
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
      // Basic consistency check - just verify consolidated data exists
      const status = await UnifiedDataService.getConsolidationStatus();
      return {
        isConsistent: status.phase === 'completed',
        issues: status.phase !== 'completed' ? ['Data not consolidated'] : []
      };
    } catch (error) {
      console.error('[useDataSynchronization] Error checking consistency:', error);
      return {
        isConsistent: false,
        issues: ['Error checking data consistency']
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
