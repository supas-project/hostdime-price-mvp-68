
import { useDataSync } from '@/hooks/useDataSync';
import { toast } from '@/utils/toast-utils';
import { initializeServerCategories } from '@/services/component-sync';

export function useSyncData(loadPriceData: () => Promise<void>) {
  const { hasUpdates, syncWithLatestData, lastSyncTime } = useDataSync();
  
  // Function to sync with latest data when updates are available
  const handleSyncData = async () => {
    try {
      if (hasUpdates) {
        await syncWithLatestData();
        await loadPriceData();
        
        // After loading the price data, also sync the wizard components
        await initializeServerCategories();
        
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
