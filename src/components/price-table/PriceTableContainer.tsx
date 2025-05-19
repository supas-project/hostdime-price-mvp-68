
import { useAuth } from "@/contexts/AuthContext";
import { usePriceTable } from "@/hooks/usePriceTable";
import { useFileHandling } from "@/hooks/useFileHandling";
import { useDataActions } from "@/hooks/price-table/useDataActions";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { PriceTablePage } from "./PriceTablePage";
import { InitService } from "@/services/init-service";
import { toast } from "sonner";

export default function PriceTableContainer() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Custom hooks
  const priceTableState = usePriceTable();
  const {
    priceData,
    setPriceData,
    activeTab,
    tableActions,
    isLoading: dataLoading,
    hasUpdates,
    loadPriceData,
    lastSyncTime
  } = priceTableState;

  const {
    isLoading: fileLoading,
    fileInputRef,
    handleFileUpload
  } = useFileHandling(setPriceData);
  
  // Data actions hook
  const {
    isRefreshing,
    hasConflicts,
    handleRefreshData,
    checkForConflicts
  } = useDataActions(setPriceData);

  // Combined loading indicator
  const isLoading = dataLoading || fileLoading || isRefreshing || !isInitialized;

  // Effect to force update when hasUpdates is true
  useEffect(() => {
    if (hasUpdates) {
      handleRefreshData();
    }
  }, [hasUpdates, handleRefreshData]);

  // Ensure data is loaded when component mounts
  useEffect(() => {
    async function initialize() {
      if (isAuthenticated) {
        try {
          // Initialize data if needed
          await InitService.initializeData();
          
          // Then load price data
          await loadPriceData();
          
          setIsInitialized(true);
        } catch (error) {
          console.error("Error initializing price table:", error);
          if (error instanceof Error && !error.message.includes("Authentication")) {
            toast.error("Error initializing price table", {
              description: "Please try again or contact support."
            });
          }
          setIsInitialized(true); // Still mark as initialized to avoid loading forever
        }
        
        // Set up periodic conflict checks
        const intervalId = setInterval(() => {
          checkForConflicts();
        }, 30000); // Check every 30 seconds
        
        return () => clearInterval(intervalId);
      } else {
        setIsInitialized(true);
      }
    }
    
    initialize();
  }, [isAuthenticated]);

  // Filter categories to remove contract category
  const filteredPriceData = priceData ? {...priceData} : {};
  if (filteredPriceData?.contract) {
    delete filteredPriceData.contract;
  }

  return (
    <PriceTablePage 
      priceTableState={priceTableState}
      filteredPriceData={filteredPriceData}
      fileInputRef={fileInputRef}
      handleFileUpload={handleFileUpload}
      handleRefreshData={handleRefreshData}
      hasConflicts={hasConflicts}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
    />
  );
}
