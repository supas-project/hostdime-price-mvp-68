
import { useEffect } from "react";

interface UpdatesHandlerProps {
  hasUpdates: boolean;
  handleRefreshData: () => Promise<void>;
}

export function UpdatesHandler({ hasUpdates, handleRefreshData }: UpdatesHandlerProps) {
  // Effect to force update when hasUpdates is true
  useEffect(() => {
    if (hasUpdates) {
      console.log("UpdatesHandler: Updates detected, refreshing data");
      handleRefreshData();
    }
  }, [hasUpdates, handleRefreshData]);

  return null; // This is a logic-only component
}
