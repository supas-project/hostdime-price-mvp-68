
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
    const { data: priceData, error } = await supabase
      .from(PRICE_DATA_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error("[PriceService] Error refreshing data from source:", error);
      toast.error("Erro ao atualizar dados", { description: error.message });
      return null;
    }
    
    if (!priceData || priceData.length === 0) {
      console.warn("[PriceService] No data found during refresh");
      return {};
    }
    
    // Process the fetched data
    const jsonData = priceData[0].data as unknown as PriceData;
    
    // Log categories found
    if (jsonData) {
      const categories = Object.keys(jsonData);
      console.log(`[PriceService] Refreshed data with ${categories.length} categories:`, categories.join(", "));
    }
    
    // Notify listeners
    notifyListeners();
    
    console.log("[PriceService] Price data refreshed successfully");
    return jsonData;
  } catch (error) {
    console.error("[PriceService] Error refreshing data from source:", error);
    return null;
  }
}
