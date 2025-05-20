
import { supabase } from '@/lib/supabase';
import { PriceData } from '@/types/pricing';
import { PRICE_DATA_TABLE } from '../constants';

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

    console.log("[PriceService] Successfully retrieved price data:", 
      Object.keys(jsonData).length > 0 ? 
      `Found ${Object.keys(jsonData).length} categories` : 
      "Empty data object");
    
    // First ensure we're dealing with an object, not an array
    if (Array.isArray(jsonData)) {
      console.error("[PriceService] Expected object data but received array");
      return {};
    }
    
    // Type assertion with proper cast - first to unknown, then to PriceData
    return jsonData as unknown as PriceData;
  } catch (err: any) {
    console.error("[PriceService] Error in getAllData:", err);
    throw new Error(err.message || "Failed to retrieve price data.");
  }
}

/**
 * Checks if there are any data changes that would conflict with local edits
 */
export async function checkForDataConflicts(): Promise<boolean> {
  try {
    // Implementation of conflict checking logic
    // For now, just returns false indicating no conflicts
    return false;
  } catch (error) {
    console.error("[PriceService] Error checking for data conflicts:", error);
    return false;
  }
}

/**
 * Forces a refresh from the latest data source
 */
export async function forceRefreshFromLatestSource(): Promise<PriceData | null> {
  try {
    console.log("[PriceService] Force refreshing data from latest source");
    
    // Get the latest data
    const latestData = await getAllData();
    
    return latestData;
  } catch (error) {
    console.error("[PriceService] Error forcing refresh from latest source:", error);
    throw error;
  }
}
