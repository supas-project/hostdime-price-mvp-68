
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
      console.log("PriceTableContainer: Updates detected, refreshing data");
      handleRefreshData();
    }
  }, [hasUpdates, handleRefreshData]);

  // Ensure data is loaded when component mounts
  useEffect(() => {
    async function initialize() {
      if (isAuthenticated) {
        try {
          console.log("PriceTableContainer: Authenticated user, attempting to initialize data");
          
          // Initialize data if needed
          await InitService.initializeData();
          
          // Then load price data
          await loadPriceData();
          
          // Log all categories para debug
          if (priceData) {
            console.log("PriceTableContainer: Available categories:", Object.keys(priceData).join(", "));
            
            // Verificar todas as categorias para garantir que estão estruturadas corretamente
            Object.keys(priceData).forEach(cat => {
              const category = priceData[cat];
              if (!category) {
                console.error(`PriceTableContainer: Category ${cat} is undefined`);
                return;
              }
              
              if (!Array.isArray(category.items)) {
                console.error(`PriceTableContainer: Category ${cat} has invalid items property:`, category.items);
                // Corrigir imediatamente
                priceData[cat].items = priceData[cat].items || [];
              } else {
                console.log(`PriceTableContainer: Category ${cat} has ${category.items.length} items`);
              }
            });
            
            // Verificar storage e external_storage especificamente
            if (priceData.storage) {
              if (Array.isArray(priceData.storage.items)) {
                console.log("PriceTableContainer: Storage category items:", priceData.storage.items.length);
              } else {
                console.error("PriceTableContainer: Storage category items is not an array:", priceData.storage.items);
                priceData.storage.items = [];
              }
            } else {
              console.log("PriceTableContainer: Storage category not found");
            }
            
            if (priceData.external_storage) {
              if (Array.isArray(priceData.external_storage.items)) {
                console.log("PriceTableContainer: External storage category items:", priceData.external_storage.items.length);
              } else {
                console.error("PriceTableContainer: External storage category items is not an array:", priceData.external_storage.items);
                priceData.external_storage.items = [];
              }
            } else {
              console.log("PriceTableContainer: External storage category not found");
            }
          }
          
          setIsInitialized(true);
        } catch (error) {
          console.error("PriceTableContainer: Error initializing price table:", error);
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
        console.log("PriceTableContainer: User not authenticated, skipping initialization");
        setIsInitialized(true);
      }
    }
    
    initialize();
  }, [isAuthenticated]);

  // Effect para garantir que o priceData seja processado após ser carregado
  useEffect(() => {
    if (priceData) {
      console.log("PriceTableContainer: Processing loaded price data");
      
      // Verificar todas as categorias para garantir que os items são arrays
      const fixedData = {...priceData};
      let needsUpdate = false;
      
      Object.keys(fixedData).forEach(key => {
        if (!fixedData[key]) return;
        
        if (!Array.isArray(fixedData[key].items)) {
          console.warn(`PriceTableContainer: Items is not an array for category ${key}, fixing...`);
          fixedData[key].items = fixedData[key].items || [];
          needsUpdate = true;
        }
      });
      
      // Forçar atualização do estado apenas se necessário
      if (needsUpdate) {
        console.log("PriceTableContainer: Updating price data with fixed arrays");
        setPriceData({...fixedData});
      }
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
