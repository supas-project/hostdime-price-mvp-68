
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
