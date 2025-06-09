
import { useEffect } from "react";
import { LoadingState } from "@/hooks/price-table/useLoadingStates";

interface UpdatesHandlerProps {
  hasUpdates: boolean;
  handleRefreshData: () => Promise<void>;
  setLoadingState: (state: LoadingState) => void;
}

export function UpdatesHandler({ 
  hasUpdates, 
  handleRefreshData, 
  setLoadingState 
}: UpdatesHandlerProps) {
  useEffect(() => {
    if (hasUpdates) {
      console.log("UpdatesHandler: Updates detected, refreshing data");
      
      const refreshWithLoading = async () => {
        try {
          setLoadingState('refreshing');
          await handleRefreshData();
          setLoadingState('idle');
        } catch (error) {
          console.error("UpdatesHandler: Error refreshing data:", error);
          setLoadingState('idle');
        }
      };
      
      refreshWithLoading();
    }
  }, [hasUpdates, handleRefreshData, setLoadingState]);

  return null;
}
