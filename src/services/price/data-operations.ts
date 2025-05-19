
import { supabase } from '@/lib/supabase';
import { PriceData, ImportOptions } from '@/types/pricing';
import { PRICE_DATA_TABLE } from './constants';
import { notifyListeners } from './listeners';
import { toast } from 'sonner';

/**
 * Gets all price data from the database
 */
export async function getAllData(): Promise<PriceData> {
  try {
    console.log("[PriceService] Getting all price data");
    // Fetch the data from price_data table
    const { data: priceData, error } = await supabase
      .from(PRICE_DATA_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error("[PriceService] Error fetching price data:", error);
      throw new Error(error.message);
    }

    if (!priceData || priceData.length === 0) {
      console.warn("[PriceService] No data found in price data table, returning default data");
      return {};
    }

    // Return the data from the JSON column
    const jsonData = priceData[0].data;

    if (!jsonData) {
      console.warn("[PriceService] No JSON data found in price data record");
      return {};
    }

    console.log("[PriceService] Successfully retrieved price data");
    // Type assertion with proper cast - first to unknown then to PriceData
    return jsonData as unknown as PriceData;
  } catch (err: any) {
    console.error("[PriceService] Error in getAllData:", err);
    throw new Error(err.message || "Failed to retrieve price data.");
  }
}

/**
 * Saves price data to the database
 */
export async function saveData(data: PriceData): Promise<void> {
  try {
    console.log("[PriceService] Saving price data");
    // Verificar se o usuário está autenticado antes de salvar dados
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("[PriceService] Authentication error:", sessionError);
      toast.error("Erro de autenticação", { 
        description: "Não foi possível verificar sua autenticação. Tente fazer login novamente." 
      });
      throw new Error("Authentication error: " + sessionError.message);
    }
    
    if (!session.session) {
      console.warn("[PriceService] No active session found, trying to proceed anyway");
    } else {
      console.log("[PriceService] Saving data with authenticated user:", session.session.user.email);
    }

    // Insert a new record with the updated data
    // We need to cast data to Json type for Supabase
    const { error } = await supabase
      .from(PRICE_DATA_TABLE)
      .insert({
        data: data as any, // Cast to any to bypass type checking
        updated_at: new Date().toISOString() // Convert Date to ISO string
      });

    if (error) {
      console.error("[PriceService] Error saving price data:", error);
      throw new Error(error.message);
    }

    console.log("[PriceService] Price data saved successfully");
  } catch (err: any) {
    console.error("[PriceService] Error in saveData:", err);
    throw new Error(err.message || "Failed to save price data.");
  }
}

/**
 * Resets the price data to its initial state
 */
export async function resetData(): Promise<PriceData | null> {
  try {
    console.log("[PriceService] Resetting price data to initial state");
    // Re-import initial data
    const { syncDiskDataWithPriceService, initExternalStorageData } = await import('../component-sync-service');
    
    // Create empty default data
    const defaultData: PriceData = {};
    
    // Save the default data first
    await saveData(defaultData);
    
    // Initialize storage data
    await initExternalStorageData();
    await syncDiskDataWithPriceService();
    
    // Fetch and return the new data
    const newData = await getAllData();
    notifyListeners();
    console.log("[PriceService] Price data reset successfully");
    return newData;
  } catch (error: any) {
    console.error("[PriceService] Error resetting data:", error);
    throw new Error(error.message || "Failed to reset data.");
  }
}

/**
 * Checks for conflicts in the price data
 */
export async function checkForDataConflicts(): Promise<boolean> {
  try {
    console.log("[PriceService] Checking for data conflicts");
    // For now, just return false
    return false;
  } catch (error) {
    console.error("[PriceService] Error checking for data conflicts:", error);
    return false;
  }
}

/**
 * Forces a refresh of price data from the latest source
 */
export async function forceRefreshFromLatestSource(): Promise<PriceData | null> {
  try {
    console.log("[PriceService] Forcing refresh of price data from latest source");
    // Re-fetch all data from the source
    const newData = await getAllData();
    
    // Notify listeners
    notifyListeners();
    
    console.log("[PriceService] Price data refreshed successfully");
    return newData;
  } catch (error) {
    console.error("[PriceService] Error refreshing data from source:", error);
    return null;
  }
}

/**
 * Imports price data from JSON
 */
export function importFromJSON(content: string): PriceData {
  try {
    console.log("[PriceService] Importing price data from JSON");
    const data = JSON.parse(content) as PriceData;
    // Save the imported data
    saveData(data);
    return data;
  } catch (error) {
    console.error("[PriceService] Error importing JSON:", error);
    throw new Error("Invalid JSON format");
  }
}

/**
 * Imports price data from CSV
 */
export function importFromCSV(content: string): PriceData {
  // For simplicity, we'll just throw an error for now
  // In a real implementation, this would parse CSV into the correct format
  throw new Error("CSV import not implemented yet");
}
