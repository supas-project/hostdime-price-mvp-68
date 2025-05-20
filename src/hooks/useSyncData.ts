
import { useDataSync } from '@/hooks/useDataSync';
import { toast } from '@/utils/toast-utils';
import { PriceData } from '@/types/pricing';
import { notifyListeners } from '@/services/price/listeners';
import { useAuth } from '@/contexts/AuthContext';

export function useSyncData(loadPriceData: () => Promise<void>) {
  const { hasUpdates, syncWithLatestData, lastSyncTime } = useDataSync();
  const { user } = useAuth();
  
  // Verifica explicitamente se o usuário é admin@hostdime.com.br
  const isAdmin = user?.email === "admin@hostdime.com.br";
  
  // Function to sync with latest data when updates are available
  const handleSyncData = async () => {
    try {
      // Verificar se o usuário é admin antes de permitir sincronização
      if (!isAdmin) {
        console.log("Only admin can sync data");
        return;
      }
      
      if (hasUpdates) {
        await syncWithLatestData();
        await loadPriceData();
        
        // Notify any listeners about the data changes
        // This ensures all components are updated when data changes
        notifyListeners();
        
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
