
import { saveData } from '../data-persistence';
import { getAllData } from '../data-retrieval';
import { notifyListeners } from '../../listeners';

/**
 * Deletes a category from the price data
 */
export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    console.log(`[PriceService] Attempting to delete category ${categoryId}`);
    
    // Get all existing data
    const allData = await getAllData();
    
    // Check if the category exists
    if (!allData[categoryId]) {
      console.error(`[PriceService] Category ${categoryId} not found`);
      return false;
    }
    
    console.log(`[PriceService] Category ${categoryId} found, proceeding with deletion`);
    console.log(`[PriceService] Current categories before deletion:`, Object.keys(allData).join(", "));
    
    // Create updated data without the category
    const updatedData = { ...allData };
    delete updatedData[categoryId];
    
    console.log(`[PriceService] Category ${categoryId} removed from data structure`);
    console.log(`[PriceService] Categories after deletion:`, Object.keys(updatedData).join(", "));
    
    // Save the updated data - this is the critical part
    try {
      await saveData(updatedData);
      console.log(`[PriceService] Data saved successfully after deleting category ${categoryId}`);
    } catch (saveError: any) {
      console.error(`[PriceService] Error saving data after category deletion:`, saveError);
      // Return false immediately if save fails - don't continue with verification
      return false;
    }
    
    // Give a small delay to ensure data is persisted
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify deletion by fetching fresh data from the server
    let freshData;
    try {
      freshData = await getAllData();
    } catch (fetchError: any) {
      console.error(`[PriceService] Error fetching fresh data for verification:`, fetchError);
      // If we can't verify, assume success since save didn't throw
      console.log(`[PriceService] Cannot verify deletion, but save was successful for category ${categoryId}`);
      notifyListeners(updatedData);
      return true;
    }
    
    // Check if category still exists in fresh data
    if (freshData[categoryId]) {
      console.error(`[PriceService] Category ${categoryId} still exists after deletion and save - this indicates a server-side issue`);
      return false;
    }
    
    console.log(`[PriceService] Deletion verified - category ${categoryId} successfully removed from server`);
    
    // Notify listeners of the change with fresh data
    notifyListeners(freshData);
    
    return true;
  } catch (err: any) {
    console.error(`[PriceService] Error in deleteCategory for ${categoryId}:`, err);
    return false;
  }
}
