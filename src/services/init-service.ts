
import { PriceService } from "./price-service";
import { syncDiskDataWithPriceService, initExternalStorageData } from "./component-sync";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle } from "lucide-react";

// This service handles initialization of the application data
export class InitService {
  static async initializeData(): Promise<boolean> {
    try {
      console.log("Initializing application data...");
      
      // Check if user is authenticated
      const { data: session } = await PriceService.supabase.auth.getSession();
      
      if (!session.session) {
        console.log("User not authenticated, skipping data initialization");
        return false;
      }
      
      // Only continue with initialization if user is authenticated
      console.log("User authenticated, continuing with data initialization");
      
      try {
        // Check if data already exists
        const existingData = await PriceService.getAllData();
        
        // If no existing data, initialize defaults
        if (!existingData || Object.keys(existingData).length === 0) {
          console.log("No existing data found, initializing defaults...");
          
          // Initialize external storage data
          await initExternalStorageData();
          
          // Sync disk data
          await syncDiskDataWithPriceService();
          
          toast.success("Dados inicializados", {
            description: "Configuração padrão carregada com sucesso.",
            icon: <CheckCircle2 />
          });

          // Save current fetch time
          localStorage.setItem('price_data_last_fetch', new Date().toISOString());
        } else {
          console.log("Existing data found:", Object.keys(existingData).length, "categories");
          
          // Save current fetch time even for existing data
          localStorage.setItem('price_data_last_fetch', new Date().toISOString());
        }
      } catch (initError) {
        console.error("Error during data initialization:", initError);
        if (initError instanceof Error && !initError.message.includes("Authentication")) {
          toast.error("Erro na inicialização", {
            description: "Não foi possível carregar os dados iniciais.",
            icon: <AlertCircle />
          });
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking authentication:", error);
      // Only show toast if it's not an authentication error
      if (error instanceof Error && !error.message.includes("Authentication")) {
        toast.error("Erro na inicialização", {
          description: "Ocorreu um erro ao inicializar os dados.",
          icon: <AlertCircle />
        });
      }
      return false;
    }
  }
}
