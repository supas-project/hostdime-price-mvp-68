
import { supabase } from '@/lib/supabase';
import { PriceData, ImportOptions } from '@/types/pricing';
import { PRICE_DATA_TABLE } from './constants';
import { notifyListeners } from './listeners';

/**
 * Gets all price data from the database
 */
export async function getAllData(): Promise<PriceData> {
  try {
    // Fetch the data from price_data table
    const { data: priceData, error } = await supabase
      .from(PRICE_DATA_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching price data:", error);
      throw new Error(error.message);
    }

    if (!priceData || priceData.length === 0) {
      console.warn("No data found in price data table, returning default data");
      return {};
    }

    // Return the data from the JSON column
    const jsonData = priceData[0].data;

    if (!jsonData) {
      console.warn("No JSON data found in price data record");
      return {};
    }

    // Type assertion with proper cast - first to unknown then to PriceData
    return jsonData as unknown as PriceData;
  } catch (err: any) {
    console.error("Error in getAllData:", err);
    throw new Error(err.message || "Failed to retrieve price data.");
  }
}

/**
 * Saves price data to the database
 */
export async function saveData(data: PriceData): Promise<void> {
  try {
    // Insert a new record with the updated data
    // We need to cast data to Json type for Supabase
    const { error } = await supabase
      .from(PRICE_DATA_TABLE)
      .insert({
        data: data as any, // Cast to any to bypass type checking
        updated_at: new Date().toISOString() // Convert Date to ISO string
      });

    if (error) {
      console.error("Error saving price data:", error);
      throw new Error(error.message);
    }
  } catch (err: any) {
    console.error("Error in saveData:", err);
    throw new Error(err.message || "Failed to save price data.");
  }
}

/**
 * Resets the price data to its initial state
 */
export async function resetData(): Promise<PriceData | null> {
  try {
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
    return newData;
  } catch (error: any) {
    console.error("Error resetting data:", error);
    throw new Error(error.message || "Failed to reset data.");
  }
}

/**
 * Checks for conflicts in the price data
 */
export async function checkForDataConflicts(): Promise<boolean> {
  try {
    // For now, just return false
    return false;
  } catch (error) {
    console.error("Error checking for data conflicts:", error);
    return false;
  }
}

/**
 * Forces a refresh of price data from the latest source
 */
export async function forceRefreshFromLatestSource(): Promise<PriceData | null> {
  try {
    // Re-fetch all data from the source
    const newData = await getAllData();
    
    // Notify listeners
    notifyListeners();
    
    return newData;
  } catch (error) {
    console.error("Error refreshing data from source:", error);
    return null;
  }
}

/**
 * Imports price data from JSON
 */
export function importFromJSON(content: string): PriceData {
  try {
    const data = JSON.parse(content) as PriceData;
    // Save the imported data
    saveData(data);
    return data;
  } catch (error) {
    console.error("Error importing JSON:", error);
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
