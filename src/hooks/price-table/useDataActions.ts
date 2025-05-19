
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useDataActions(setPriceData: (data: any) => void) {
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasConflicts, setHasConflicts] = useState(false);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const { registerAdminChange, syncWithLatestData } = useDataSync();

  // Explicit check to ensure admin access
  const isAdminAccess = user?.email === "admin@hostdime.com.br";

  // Periodically check for data conflicts
  const checkForConflicts = async () => {
    try {
      const hasDataConflicts = await PriceService.checkForDataConflicts();
      setHasConflicts(hasDataConflicts);
      
      if (hasDataConflicts && !isAdminAccess) {
        toast.info("Changes detected", {
          description: "The administrator modified the data. Click 'Update data' to synchronize.",
          duration: 6000
        });
      }
    } catch (error) {
      console.error("Error checking for conflicts:", error);
    }
  };

  // Handle exporting data as JSON
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await PriceService.getAllData();
      
      if (!data) {
        toast.error("Export failed", {
          description: "No data available to export."
        });
        return;
      }
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      // Create an invisible link and trigger a download
      const exportFileDefaultName = `price-data-${new Date().toISOString().slice(0, 10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Export complete", {
        description: "Data exported successfully."
      });
    } catch (error) {
      toast.error("Export failed", {
        description: "Could not export the data."
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle resetting data to initial state
  const handleResetData = async () => {
    if (!isAdminAccess) {
      toast.error("Permission denied", {
        description: "Only administrators can reset data."
      });
      return;
    }

    if (confirm("Are you sure you want to reset all data to default? This action cannot be undone.")) {
      try {
        setIsResetting(true);
        
        // Reset data in PriceService
        const resetData = await PriceService.resetData();
        
        if (resetData) {
          // Update state with reset data
          setPriceData(resetData);
          
          // Register change to notify other users
          await registerAdminChange("reset", "All data has been reset to default values");
          
          toast.success("Data reset", {
            description: "All data has been reset to default values."
          });
        } else {
          toast.error("Reset failed", {
            description: "Could not reset the data."
          });
        }
      } catch (error) {
        console.error("Error resetting data:", error);
        toast.error("Reset failed", {
          description: "An error occurred while resetting data."
        });
      } finally {
        setIsResetting(false);
      }
    }
  };

  // Function to force data update when there are multi-user conflicts
  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      
      // Force reload data from Supabase (possibly updated by another user)
      console.log("Refreshing data from source");
      const refreshedData = await PriceService.forceRefreshFromLatestSource();
      
      if (refreshedData) {
        // Update state with updated data
        setPriceData(refreshedData);
        setHasConflicts(false);
        
        // Update sync state
        await syncWithLatestData();
        
        toast.success("Data updated", {
          description: "Data has been synchronized with the latest source."
        });
      } else {
        toast.error("Update failed", {
          description: "Could not synchronize data."
        });
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Update failed", {
        description: "An error occurred while updating data."
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check for data conflicts and notify if necessary
  const checkForDataConflicts = async (): Promise<boolean> => {
    return await PriceService.checkForDataConflicts();
  };

  return {
    isExporting,
    isResetting,
    isRefreshing,
    hasConflicts,
    handleExportData,
    handleResetData,
    handleRefreshData,
    checkForDataConflicts,
    checkForConflicts
  };
}
