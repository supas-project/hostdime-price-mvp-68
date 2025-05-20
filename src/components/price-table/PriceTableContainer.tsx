
import { useAuth } from "@/contexts/AuthContext";
import { usePriceTable } from "@/hooks/usePriceTable";
import { useFileHandling } from "@/hooks/useFileHandling";
import { useDataActions } from "@/hooks/price-table/useDataActions";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { PriceTablePage } from "./PriceTablePage";
import { InitService } from "@/services/init-service";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function PriceTableContainer() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [skipAutoInit, setSkipAutoInit] = useState(false);
  
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

  // Check if we have any data to determine if initialization is needed
  useEffect(() => {
    // If we have price data with categories, skip automatic initialization
    if (priceData && Object.keys(priceData).length > 0) {
      console.log("Price data exists, skipping automatic initialization");
      setSkipAutoInit(true);
    }
  }, [priceData]);

  // Ensure data is loaded when component mounts and when returning to this page
  useEffect(() => {
    async function initialize() {
      if (isAuthenticated) {
        try {
          console.log("Authenticated user, attempting to initialize data");
          setIsInitialized(false);
          
          // Only initialize data if we don't have any data
          // This prevents recreating deleted categories
          if (!skipAutoInit) {
            await InitService.initializeData();
          } else {
            console.log("Skipping initialization because data already exists");
          }
          
          // Then load price data
          await loadPriceData();
          
          setIsInitialized(true);
        } catch (error) {
          console.error("Error initializing price table:", error);
          if (error instanceof Error && !error.message.includes("Authentication")) {
            toast.error("Erro ao inicializar tabela", {
              description: "Por favor, tente novamente ou contate o suporte.",
              icon: <AlertCircle className="h-5 w-5" />
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
        console.log("User not authenticated, skipping initialization");
        setIsInitialized(true);
      }
    }
    
    initialize();
    
    // Add this effect to refresh data when the user returns to this page
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && isInitialized) {
        console.log("Page visibility changed to visible, refreshing data");
        loadPriceData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, skipAutoInit]);

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
