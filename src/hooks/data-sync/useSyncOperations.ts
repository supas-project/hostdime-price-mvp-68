
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast-utils';

/**
 * Hook for data synchronization operations
 */
export function useSyncOperations(
  isAuthenticated: boolean,
  setLastSyncTime: (time: Date) => void,
  setHasUpdates: (hasUpdates: boolean) => void
) {
  // Sync with latest updates
  const syncWithLatestData = async () => {
    try {
      if (!isAuthenticated) {
        console.error("User not authenticated to sync data");
        return false;
      }

      const { data, error } = await supabase
        .from('price_data_updates')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching latest update:", error);
        return false;
      }
      
      if (data) {
        setLastSyncTime(new Date(data.updated_at));
        setHasUpdates(false);
        return true;
      }
    } catch (error) {
      console.error("Error syncing with latest data:", error);
    }
    
    return false;
  };

  return {
    syncWithLatestData
  };
}
