
import { useEffect } from "react";
import { PriceService } from "@/services/price-service";
import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";

interface DataSyncHandlerProps {
  selectedDisks: { disk: PricedDiskOption; quantity: number }[];
  hasLocalChanges: boolean;
  persistSelectionsToDatabase: (disks: { disk: PricedDiskOption; quantity: number }[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useDataSyncHandler({
  selectedDisks,
  hasLocalChanges,
  persistSelectionsToDatabase,
  refreshData
}: DataSyncHandlerProps) {
  // Periodically save changes to the database if we have local changes
  useEffect(() => {
    if (hasLocalChanges) {
      const timer = setTimeout(() => {
        persistSelectionsToDatabase(selectedDisks);
      }, 2000); // Save to database after 2 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [selectedDisks, hasLocalChanges, persistSelectionsToDatabase]);

  // Add visibility state handler for leaving/returning to page
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log("[useDataSyncHandler] Page visibility changed to visible, checking for data changes");
        
        try {
          // Check if there are any conflicts between our local state and the server
          const conflict = await PriceService.checkForDataConflicts();
          
          if (conflict) {
            console.log("[useDataSyncHandler] Data conflicts detected, refreshing from server");
            
            // If there are conflicts, refresh data from the server
            await PriceService.forceRefreshFromLatestSource()
              .then(() => {
                console.log("[useDataSyncHandler] Disk data refreshed from latest source");
                
                // After refreshing server data, reload data in the UI
                refreshData();
              })
              .catch(error => {
                if (!error.message.includes("Authentication")) {
                  console.error("[useDataSyncHandler] Error refreshing disk data:", error);
                  toast.error("Erro ao atualizar dados de disco");
                }
              });
          } else {
            console.log("[useDataSyncHandler] No data conflicts detected");
            
            // If we have unsaved local changes, persist them now
            if (hasLocalChanges) {
              await persistSelectionsToDatabase(selectedDisks);
            }
          }
        } catch (error) {
          console.error("[useDataSyncHandler] Error checking for data conflicts:", error);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Always persist changes when component unmounts
      if (hasLocalChanges && selectedDisks.length > 0) {
        persistSelectionsToDatabase(selectedDisks);
      }
    };
  }, [hasLocalChanges, selectedDisks, refreshData, persistSelectionsToDatabase]);

  // Listen for storage data updates from other components
  useEffect(() => {
    const handleStorageDataUpdated = () => {
      console.log("[useDataSyncHandler] Storage data updated event received");
      refreshData();
    };
    
    window.addEventListener('storage-data-updated', handleStorageDataUpdated);
    
    return () => {
      window.removeEventListener('storage-data-updated', handleStorageDataUpdated);
    };
  }, [refreshData]);

  return {};
}
