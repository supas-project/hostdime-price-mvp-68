
import { useDataSync } from '@/hooks/useDataSync';
import { toast } from 'sonner';

export function useSyncData(loadPriceData: () => Promise<void>) {
  const { hasUpdates, syncWithLatestData, lastSyncTime } = useDataSync();
  
  // Function to sync with latest data when updates are available
  const handleSyncData = async () => {
    if (hasUpdates) {
      await syncWithLatestData();
      await loadPriceData();
      toast.success("Dados atualizados com sucesso!");
    }
  };

  return {
    hasUpdates,
    handleSyncData,
    lastSyncTime
  };
}
