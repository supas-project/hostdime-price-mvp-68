
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
    
    // Remove the category using destructuring
    const { [categoryId]: removedCategory, ...updatedData } = allData;
    
    console.log(`[PriceService] Category ${categoryId} removed from data structure`);
    console.log(`[PriceService] Remaining categories:`, Object.keys(updatedData).join(", "));
    
    // Save the updated data
    await saveData(updatedData);
    
    console.log(`[PriceService] Updated data saved successfully after deleting category ${categoryId}`);
    
    // Notify listeners of the change
    notifyListeners(updatedData);
    
    return true;
  } catch (err: any) {
    console.error(`[PriceService] Error in deleteCategory for ${categoryId}:`, err);
    return false;
  }
}
