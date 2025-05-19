
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
        
        toast.success("Data initialized successfully", {
          description: "Default configuration loaded successfully."
        });

        // Save current fetch time
        localStorage.setItem('price_data_last_fetch', new Date().toISOString());
      } else {
        console.log("Existing data found:", Object.keys(existingData).length, "categories");
        
        // Save current fetch time even for existing data
        localStorage.setItem('price_data_last_fetch', new Date().toISOString());
      }
      
      return true;
    } catch (error) {
      console.error("Error initializing data:", error);
      toast.error("Error initializing data");
      return false;
    }
  }
}
