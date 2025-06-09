
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { InitService } from "@/services/init-service";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface PriceTableInitializerProps {
  isAuthenticated: boolean;
  loadPriceData: () => Promise<any>;
  priceData: any;
  setIsInitialized: (value: boolean) => void;
  checkForConflicts: () => void;
}

export function PriceTableInitializer({
  isAuthenticated,
  loadPriceData,
  priceData,
  setIsInitialized,
  checkForConflicts
}: PriceTableInitializerProps) {
  // Ensure data is loaded when component mounts
  useEffect(() => {
    async function initialize() {
      if (isAuthenticated) {
        try {
          console.log("PriceTableInitializer: Authenticated user, attempting to initialize data");
          
          // Initialize data if needed
          await InitService.initializeData();
          
          // Then load price data
          await loadPriceData();
          
          console.log("PriceTableInitializer: Data loaded successfully");
          
          setIsInitialized(true);
        } catch (error) {
          console.error("PriceTableInitializer: Error initializing price table:", error);
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
        console.log("PriceTableInitializer: User not authenticated, skipping initialization");
        setIsInitialized(true);
      }
    }
    
    initialize();
  }, [isAuthenticated, loadPriceData, setIsInitialized, checkForConflicts]);

  return null; // This is a logic-only component
}
