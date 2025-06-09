
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
    
    // Save the updated data
    await saveData(updatedData);
    
    console.log(`[PriceService] Updated data saved successfully after deleting category ${categoryId}`);
    
    // Verify deletion by fetching fresh data
    const freshData = await getAllData();
    if (freshData[categoryId]) {
      console.error(`[PriceService] Category ${categoryId} still exists after deletion - operation failed`);
      return false;
    }
    
    console.log(`[PriceService] Deletion verified - category ${categoryId} successfully removed`);
    
    // Notify listeners of the change with fresh data
    notifyListeners(freshData);
    
    return true;
  } catch (err: any) {
    console.error(`[PriceService] Error in deleteCategory for ${categoryId}:`, err);
    return false;
  }
}
