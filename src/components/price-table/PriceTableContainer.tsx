
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
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [skipAutoInit, setSkipAutoInit] = useState(false);
  const [userHasRequestedInit, setUserHasRequestedInit] = useState(false);
  const [listenersAttached, setListenersAttached] = useState(false);
  
  // Verifica explicitamente se o usuário é admin@hostdime.com.br
  const isAdminUser = user?.email === "admin@hostdime.com.br";
  
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

  // Effect to force update when hasUpdates is true - apenas para admin
  useEffect(() => {
    if (hasUpdates && isAdminUser) {
      handleRefreshData().then(() => {
        // Notify WizardContent component about the data change
        window.dispatchEvent(new CustomEvent('price-table-data-updated'));
      });
    }
  }, [hasUpdates, handleRefreshData, isAdminUser]);

  // Check if we have any data to determine if initialization is needed
  useEffect(() => {
    // If we have price data with categories, skip automatic initialization
    if (priceData && Object.keys(priceData).length > 0) {
      console.log("Price data exists, skipping automatic initialization");
      setSkipAutoInit(true);
    }
  }, [priceData]);
  
  // Setup global event listeners for data synchronization - limitado apenas para admin
  useEffect(() => {
    if (!listenersAttached && isAuthenticated && isAdminUser) {
      // Set up event listeners for synchronization
      const handleDataRefreshed = () => {
        console.log("Data-refreshed event received, reloading price data");
        loadPriceData();
      };
      
      const handleServerDataUpdated = () => {
        console.log("Server-data-updated event received, reloading price data");
        loadPriceData();
      };
      
      const handleItemDeleted = (e: CustomEvent) => {
        console.log("Item-deleted event received", e.detail);
        // Refresh data after deletion to ensure consistency
        checkForConflicts().then(hasConflicts => {
          if (hasConflicts && isAdminUser) {
            handleRefreshData();
          }
        });
      };
      
      const handleCategoryDeleted = (e: CustomEvent) => {
        console.log("Category-deleted event received", e.detail);
        // Refresh data after deletion to ensure consistency
        checkForConflicts().then(hasConflicts => {
          if (hasConflicts && isAdminUser) {
            handleRefreshData();
          }
        });
      };
      
      // Listen for storage events from other tabs - apenas para admin
      const handleStorageEvent = (e: StorageEvent) => {
        if (e.key === 'deletedItems' || e.key === 'deletedCategories' || e.key === 'price_data_last_fetch') {
          console.log("Storage event detected, checking for conflicts");
          checkForConflicts().then(hasConflicts => {
            if (hasConflicts && isAdminUser) {
              handleRefreshData();
            }
          });
        }
      };
      
      // Add event listeners
      window.addEventListener('data-refreshed', handleDataRefreshed);
      window.addEventListener('server-data-updated', handleServerDataUpdated);
      window.addEventListener('item-deleted', handleItemDeleted as EventListener);
      window.addEventListener('category-deleted', handleCategoryDeleted as EventListener);
      window.addEventListener('storage', handleStorageEvent);
      
      // Mark listeners as attached
      setListenersAttached(true);
      
      // Return cleanup function
      return () => {
        window.removeEventListener('data-refreshed', handleDataRefreshed);
        window.removeEventListener('server-data-updated', handleServerDataUpdated);
        window.removeEventListener('item-deleted', handleItemDeleted as EventListener);
        window.removeEventListener('category-deleted', handleCategoryDeleted as EventListener);
        window.removeEventListener('storage', handleStorageEvent);
      };
    }
  }, [
    isAuthenticated, 
    listenersAttached, 
    loadPriceData, 
    checkForConflicts, 
    handleRefreshData,
    isAdminUser
  ]);

  // Ensure data is loaded when component mounts and when returning to this page
  useEffect(() => {
    async function initialize() {
      if (isAuthenticated) {
        try {
          console.log("Authenticated user, attempting to initialize data");
          setIsInitialized(false);
          
          // Only initialize data if explicitly requested or if there's no data
          // This prevents recreating deleted categories
          if (!skipAutoInit || userHasRequestedInit) {
            await InitService.initializeData();
          } else {
            console.log("Skipping initialization because data already exists or not requested");
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
        
        // Set up periodic conflict checks - apenas para admin
        if (isAdminUser) {
          const intervalId = setInterval(() => {
            checkForConflicts();
          }, 30000); // Check every 30 seconds
          
          return () => clearInterval(intervalId);
        }
      } else {
        console.log("User not authenticated, skipping initialization");
        setIsInitialized(true);
      }
    }
    
    initialize();
    
    // Add this effect to refresh data when the user returns to this page - apenas para admin
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && isInitialized && isAdminUser) {
        console.log("Page visibility changed to visible, refreshing data");
        loadPriceData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, skipAutoInit, userHasRequestedInit, isAdminUser]);

  // Called when user explicitly requests data initialization
  const handleRequestInitialization = () => {
    setUserHasRequestedInit(true);
    InitService.initializeData().then(() => {
      loadPriceData();
      // Notify server component about the data change
      window.dispatchEvent(new CustomEvent('price-table-data-updated'));
    });
    toast.info("Inicializando categorias padrão");
  };

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
      onRequestInitialization={handleRequestInitialization}
    />
  );
}
