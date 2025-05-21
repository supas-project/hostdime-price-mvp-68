
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
    
    // Remove the category
    const { [categoryId]: removed, ...updatedData } = allData;
    console.log(`[PriceService] Category ${categoryId} removed, saving updated data`);
    
    // Save the updated data
    await saveData(updatedData);
    
    // Notify listeners of the change
    console.log(`[PriceService] Notifying listeners about category ${categoryId} deletion`);
    notifyListeners(updatedData);
    
    return true;
  } catch (err: any) {
    console.error(`[PriceService] Error in deleteCategory for ${categoryId}:`, err);
    return false;
  }
}
