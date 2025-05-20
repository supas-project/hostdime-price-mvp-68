
import { PriceData } from '@/types/pricing';
import { supabase } from '@/lib/supabase';
import { PRICE_DATA_TABLE } from '../constants';
import { toast } from 'sonner';
import { notifyListeners } from '../listeners';

/**
 * Checks for conflicts in the price data
 */
export async function checkForDataConflicts(): Promise<boolean> {
  try {
    console.log("[PriceService] Checking for data conflicts");
    
    // Get the last update time from the database
    const { data: updates, error } = await supabase
      .from('price_data_updates')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error("[PriceService] Error checking for data conflicts:", error);
      return false;
    }
    
    if (!updates || updates.length === 0) {
      return false;
    }
    
    // Get the last time we fetched data
    const lastFetchTime = localStorage.getItem('price_data_last_fetch');
    if (!lastFetchTime) {
      return true; // We haven't fetched data yet, so there might be conflicts
    }
    
    const lastUpdateTime = new Date(updates[0].updated_at);
    const lastFetch = new Date(lastFetchTime);
    
    // If there's an update newer than our last fetch, there's a conflict
    return lastUpdateTime > lastFetch;
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
    const { data: priceData, error } = await supabase
      .from(PRICE_DATA_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error("[PriceService] Error refreshing data from source:", error);
      toast.error("Error updating data", { description: error.message });
      return null;
    }
    
    if (!priceData || priceData.length === 0) {
      console.warn("[PriceService] No data found during refresh");
      return {};
    }
    
    // Process the fetched data
    const jsonData = priceData[0].data;
    
    // Log categories found
    if (jsonData && typeof jsonData === 'object' && !Array.isArray(jsonData)) {
      const categories = Object.keys(jsonData);
      console.log(`[PriceService] Refreshed data with ${categories.length} categories:`, categories.join(", "));
      
      // Save the current time as last fetch time
      localStorage.setItem('price_data_last_fetch', new Date().toISOString());
      
      // Type assertion with proper cast - first to unknown, then to PriceData
      const typedData = jsonData as unknown as PriceData;
      
      // Notify listeners with the new data
      notifyListeners(typedData);
      
      console.log("[PriceService] Price data refreshed successfully");
      return typedData;
    } else {
      console.error("[PriceService] Invalid data format received");
      return {};
    }
  } catch (error) {
    console.error("[PriceService] Error refreshing data from source:", error);
    return null;
  }
}
