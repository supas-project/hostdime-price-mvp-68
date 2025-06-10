
import { useDataSync } from '@/hooks/useDataSync';
import { toast } from '@/utils/toast-utils';
import { PriceService } from '@/services/price-service';
import { notifyListeners } from '@/services/price/listeners';

export function useSyncData() {
  const { hasUpdates, syncWithLatestData, lastSyncTime } = useDataSync();
  
  // Function to sync with latest data when updates are available
  const handleSyncData = async () => {
    try {
      if (hasUpdates) {
        console.log("[useSyncData] Syncing data with latest version...");
        await syncWithLatestData();
        
        // Ensure data is properly refreshed from server
        await PriceService.forceRefreshFromLatestSource();
        
        // Notify any listeners about the data changes
        // This ensures all components are updated when data changes
        notifyListeners();
        
        toast.success("Data updated successfully!");
      }
    } catch (error) {
      console.error("[useSyncData] Error syncing data:", error);
      toast.error("Failed to sync data. Please try again.");
    }
  };

  return {
    hasUpdates,
    handleSyncData,
    lastSyncTime
  };
}
