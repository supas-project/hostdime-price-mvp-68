
import { useDataSync } from '@/hooks/useDataSync';
import { toast } from '@/utils/toast-utils';
import { PriceData } from '@/types/pricing';
import { notifyListeners } from '@/services/price/listeners';

export function useSyncData(loadPriceData: () => Promise<void>) {
  const { hasUpdates, syncWithLatestData, lastSyncTime } = useDataSync();
  
  // Function to sync with latest data when updates are available
  const handleSyncData = async () => {
    try {
      if (hasUpdates) {
        await syncWithLatestData();
        await loadPriceData();
        
        // Notificar com dados atualizados (ou null se não houver)
        // Certifique-se de obter os dados mais recentes para notificar
        const updatedData = await PriceService.getAllData();
        notifyListeners(updatedData);
        
        toast.success("Data updated successfully!");
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      toast.error("Failed to sync data. Please try again.");
    }
  };

  return {
    hasUpdates,
    handleSyncData,
    lastSyncTime
  };
}
