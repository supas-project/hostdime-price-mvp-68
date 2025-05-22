
import { useState, useEffect } from 'react';
import { useDataSync } from '@/hooks/useDataSync';
import { PriceService } from '@/services/price-service';
import { toast } from '@/utils/toast-utils';

/**
 * Hook for managing data synchronization
 */
export function useSyncData(loadPriceData: () => Promise<void>) {
  const [hasUpdates, setHasUpdates] = useState(false);
  const { lastSyncTime, syncWithLatestData } = useDataSync();

  // Check for updates when lastSyncTime changes
  useEffect(() => {
    const checkUpdates = async () => {
      const hasConflicts = await PriceService.checkForDataConflicts();
      setHasUpdates(hasConflicts);
    };
    
    checkUpdates();
  }, [lastSyncTime]);

  // Handle data synchronization
  const handleSyncData = async () => {
    try {
      // Sync with latest data
      await syncWithLatestData();
      
      // Reload price data
      await loadPriceData();
      
      // Clear updates flag
      setHasUpdates(false);
      
      toast.success("Dados sincronizados", {
        description: "Os dados foram sincronizados com sucesso."
      });
    } catch (error) {
      toast.error("Erro na sincronização", {
        description: error instanceof Error ? error.message : "Ocorreu um erro ao sincronizar os dados."
      });
      console.error("[SyncData] Error syncing data:", error);
    }
  };

  return { 
    hasUpdates,
    handleSyncData,
    lastSyncTime
  };
}
