
import { PriceData } from '@/types/pricing';
import { saveData } from './data-persistence';
import { notifyListeners } from '../listeners';
import { syncDiskDataWithPriceService, initExternalStorageData } from '@/services/component-sync/initialization';

/**
 * Resets the price data to its initial state
 */
export async function resetData(): Promise<PriceData | null> {
  try {
    console.log("[PriceService] Resetting price data to initial state");
    
    // Create empty default data
    const defaultData: PriceData = {};
    
    // Save the default data first
    await saveData(defaultData);
    
    // Initialize storage data
    await initExternalStorageData();
    await syncDiskDataWithPriceService();
    
    // Fetch and return the new data
    const { getAllData } = await import('./data-retrieval');
    const newData = await getAllData();
    notifyListeners();
    console.log("[PriceService] Price data reset successfully");
    return newData;
  } catch (error: any) {
    console.error("[PriceService] Error resetting data:", error);
    throw new Error(error.message || "Failed to reset data.");
  }
}
