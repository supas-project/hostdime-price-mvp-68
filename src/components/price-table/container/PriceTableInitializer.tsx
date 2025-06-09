
import { useEffect, useRef } from "react";
import { InitService } from "@/services/init-service";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { LoadingState } from "@/hooks/price-table/useLoadingStates";

interface PriceTableInitializerProps {
  isAuthenticated: boolean;
  loadPriceData: () => Promise<any>;
  priceData: any;
  setIsInitialized: (value: boolean) => void;
  checkForConflicts: () => void;
  setLoadingState: (state: LoadingState) => void;
}

export function PriceTableInitializer({
  isAuthenticated,
  loadPriceData,
  priceData,
  setIsInitialized,
  checkForConflicts,
  setLoadingState
}: PriceTableInitializerProps) {
  const initializationRef = useRef(false);
  
  useEffect(() => {
    async function initialize() {
      // Prevent multiple initializations
      if (initializationRef.current) {
        console.log("PriceTableInitializer: Already initialized, skipping");
        return;
      }

      if (isAuthenticated) {
        try {
          console.log("PriceTableInitializer: Starting initialization");
          initializationRef.current = true;
          
          setLoadingState('initializing');
          await InitService.initializeData();
          
          setLoadingState('loading-data');
          await loadPriceData();
          
          console.log("PriceTableInitializer: Data loaded successfully");
          setLoadingState('idle');
          setIsInitialized(true);
          
          // Set up conflict checking interval
          const intervalId = setInterval(() => {
            checkForConflicts();
          }, 30000);
          
          return () => clearInterval(intervalId);
        } catch (error) {
          console.error("PriceTableInitializer: Error initializing price table:", error);
          setLoadingState('idle');
          
          if (error instanceof Error && !error.message.includes("Authentication")) {
            toast.error("Erro ao inicializar tabela", {
              description: "Por favor, tente novamente ou contate o suporte.",
              icon: <AlertCircle className="h-5 w-5" />
            });
          }
          setIsInitialized(true);
        }
      } else {
        console.log("PriceTableInitializer: User not authenticated, skipping initialization");
        setLoadingState('idle');
        setIsInitialized(true);
      }
    }
    
    initialize();
  }, [isAuthenticated]); // Remove other dependencies to prevent loops

  return null;
}
