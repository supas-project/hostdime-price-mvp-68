
import ComponentSyncService from "./component-sync-service";
import { PriceService } from "./price-service";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/**
 * Initializes services and syncs data
 */
export const initializeServices = async () => {
  console.log("Initializing services and syncing data...");
  
  try {
    // Verify Supabase connection
    try {
      // Test if Supabase client is working correctly
      const { data, error } = await supabase.auth.getSession();
      if (!error) {
        console.log("Supabase connection established successfully");
      } else {
        console.warn("Warning: Error connecting to Supabase:", error.message);
      }
    } catch (supabaseError) {
      console.warn("Warning: Error connecting to Supabase. Using offline mode.", supabaseError);
    }
    
    // Initialize price service to ensure we have basic structures
    await PriceService.initialize();
    
    // Check if data already exists in price table
    const priceData = await PriceService.getAllData();

    // Check for essential categories and initialize if needed
    const hasCpuData = priceData?.cpu && priceData.cpu.items.length > 0;
    const hasMemoryData = priceData?.memory && priceData.memory.items.length > 0;
    const hasDiskData = priceData?.disk && priceData.disk.items.length > 0;
    const hasOsData = priceData?.os && priceData.os.items.length > 0;
    const hasStorageData = priceData?.storage && priceData.storage.items.length > 0;
    
    // If no data, initialize with default data
    if (!hasCpuData || !hasMemoryData || !hasDiskData || !hasOsData || !hasStorageData) {
      console.log("Initializing price table data...");
      
      // Initialize only categories that don't have data
      if (!hasCpuData) await ComponentSyncService.syncCpuData();
      if (!hasMemoryData) await ComponentSyncService.syncMemoryData();
      if (!hasDiskData) await ComponentSyncService.syncDiskData();
      if (!hasOsData) await ComponentSyncService.syncOSData();
      if (!hasStorageData) await ComponentSyncService.syncStorageData();
      
      toast("Initial data loaded successfully");
    } else {
      console.log("Price table data already exists. Synchronization not necessary.");
    }
  } catch (error) {
    console.error("Error during service initialization:", error);
    toast("Error during service initialization");
  }
};

// Export service by default
export default {
  initializeServices
};
