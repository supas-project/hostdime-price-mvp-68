
import { PriceService } from "./price-service";
import { syncDiskDataWithPriceService, initExternalStorageData } from "./component-sync";
import { toast } from "sonner";

// This service handles initialization of the application data
export class InitService {
  static async initializeData(): Promise<boolean> {
    try {
      console.log("Initializing application data...");
      
      // Check if data already exists
      const existingData = await PriceService.getAllData();
      
      // If no existing data, initialize defaults
      if (!existingData || Object.keys(existingData).length === 0) {
        console.log("No existing data found, initializing defaults...");
        
        // Initialize external storage data
        await initExternalStorageData();
        
        // Sync disk data
        await syncDiskDataWithPriceService();
        
        toast.success("Dados inicializados com sucesso", {
          description: "Configuração padrão carregada com sucesso."
        });
      } else {
        console.log("Existing data found, initialization skipped.");
      }
      
      return true;
    } catch (error) {
      console.error("Error initializing data:", error);
      toast.error("Erro ao inicializar dados");
      return false;
    }
  }
}
