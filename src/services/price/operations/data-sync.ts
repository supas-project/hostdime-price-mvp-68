
import { PriceData } from '@/types/pricing';
import { supabase } from '@/lib/supabase';
import { PRICE_DATA_TABLE } from '../constants';
import { getAllData } from './data-retrieval';

/**
 * Saves price data to the database
 */
export async function saveData(data: PriceData): Promise<boolean> {
  try {
    console.log("[PriceService] Saving price data");
    
    // Insert data into price_data table
    const { error } = await supabase
      .from(PRICE_DATA_TABLE)
      .insert({ data });

    if (error) {
      console.error("[PriceService] Error saving price data:", error);
      throw new Error(error.message);
    }

    console.log("[PriceService] Successfully saved price data");
    
    // Also record the update in the price_data_updates table
    const { error: updateError } = await supabase
      .from('price_data_updates')
      .insert({ 
        type: 'update',
        details: 'Manual data update'
      });

    if (updateError) {
      console.warn("[PriceService] Error recording update in price_data_updates table:", updateError);
      // Don't throw error here, as the main data save was successful
    }

    return true;
  } catch (err: any) {
    console.error("[PriceService] Error in saveData:", err);
    throw new Error(err.message || "Failed to save price data.");
  }
}

/**
 * Checks if there are any conflicts between local data and remote data
 */
export async function checkForDataConflicts(): Promise<boolean> {
  try {
    console.log("[PriceService] Checking for data conflicts");
    
    // Get last update time from updates table
    const { data: updateData, error: updateError } = await supabase
      .from('price_data_updates')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (updateError) {
      console.warn("[PriceService] Error checking for updates:", updateError);
      return false;
    }

    // If there's no update data, there can't be conflicts
    if (!updateData) {
      return false;
    }

    // Compare timestamps to determine if there are conflicts
    const lastUpdateTime = new Date(updateData.updated_at).getTime();
    const localUpdateTime = localStorage.getItem('price_data_last_updated');
    
    if (!localUpdateTime) {
      // No local timestamp, consider it as a conflict to be safe
      return true;
    }

    // If remote is newer than local, we have a conflict
    return lastUpdateTime > parseInt(localUpdateTime);
  } catch (err: any) {
    console.error("[PriceService] Error checking for conflicts:", err);
    return false;
  }
}

/**
 * Forces a refresh of data from the latest source
 */
export async function forceRefreshFromLatestSource(): Promise<PriceData | null> {
  try {
    console.log("[PriceService] Force refreshing data from latest source");
    
    // Get latest data
    const latestData = await getAllData();
    
    if (latestData) {
      // Update local timestamp
      localStorage.setItem('price_data_last_updated', new Date().getTime().toString());
      return latestData;
    }
    
    return null;
  } catch (err: any) {
    console.error("[PriceService] Error force refreshing data:", err);
    return null;
  }
}
