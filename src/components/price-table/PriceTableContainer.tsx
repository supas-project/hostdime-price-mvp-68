
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
          console.log("Authenticated user, attempting to initialize data");
          
          // Initialize data if needed
          await InitService.initializeData();
          
          // Then load price data
          await loadPriceData();
          
          // Log all categories para debug
          if (priceData) {
            console.log("Available categories:", Object.keys(priceData).join(", "));
            
            // Verificar todas as categorias para garantir que estão estruturadas corretamente
            Object.keys(priceData).forEach(cat => {
              const category = priceData[cat];
              if (!category) {
                console.error(`Category ${cat} is undefined`);
                return;
              }
              
              if (!Array.isArray(category.items)) {
                console.error(`Category ${cat} has invalid items property:`, category.items);
              } else {
                console.log(`Category ${cat} has ${category.items.length} items`);
              }
            });
            
            // Verificar storage e external_storage especificamente
            if (priceData.storage) {
              if (Array.isArray(priceData.storage.items)) {
                console.log("Storage category items:", priceData.storage.items.length);
              } else {
                console.error("Storage category items is not an array:", priceData.storage.items);
              }
            } else {
              console.log("Storage category not found");
            }
            
            if (priceData.external_storage) {
              if (Array.isArray(priceData.external_storage.items)) {
                console.log("External storage category items:", priceData.external_storage.items.length);
              } else {
                console.error("External storage category items is not an array:", priceData.external_storage.items);
              }
            } else {
              console.log("External storage category not found");
            }
          }
          
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
  }, [isAuthenticated]);

  // Effect para garantir que o priceData seja processado após ser carregado
  useEffect(() => {
    if (priceData) {
      // Verificar todas as categorias para garantir que os items são arrays
      Object.keys(priceData).forEach(key => {
        if (!priceData[key]) return;
        
        if (!Array.isArray(priceData[key].items)) {
          console.warn(`PriceTableContainer: Items is not an array for category ${key}, fixing...`);
          priceData[key].items = priceData[key].items || [];
          // Forçar atualização do estado
          setPriceData({...priceData});
        }
      });
    }
  }, [priceData, setPriceData]);

  // Filter categories to remove contract category (mas não storage ou external_storage)
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
