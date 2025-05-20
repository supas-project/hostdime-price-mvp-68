
import { saveData } from '../../operations/data-persistence';
import { PriceService } from '@/services/price-service';
import { notifyListeners } from '../../listeners';

/**
 * Deletes a category from the price data
 */
export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    console.log(`[PriceService] Attempting to delete category ${categoryId}`);
    
    // Get all existing data
    const allData = await PriceService.getAllData();
    
    // Check if the category exists
    if (!allData[categoryId]) {
      console.error(`[PriceService] Category ${categoryId} not found`);
      return false;
    }
    
    // Get the category name before removing it
    const categoryName = allData[categoryId].name;
    
    // Remove the category
    const { [categoryId]: removed, ...updatedData } = allData;
    console.log(`[PriceService] Category ${categoryId} removed, saving updated data`);
    
    // Save the updated data
    await saveData(updatedData);
    
    // Track this deletion in localStorage to prevent recreation
    try {
      const deletedCategories = JSON.parse(localStorage.getItem('deletedCategories') || '{}');
      deletedCategories[categoryId] = {
        id: categoryId,
        name: categoryName,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('deletedCategories', JSON.stringify(deletedCategories));
      console.log(`[PriceService] Category ${categoryId} marked as deleted in localStorage`);
      
      // Dispatch event to notify components of category deletion
      window.dispatchEvent(new CustomEvent('category-deleted', {
        detail: { categoryId, categoryName }
      }));
    } catch (storageErr) {
      console.error("Could not update localStorage with deleted category", storageErr);
    }
    
    // Notify listeners of the change
    console.log(`[PriceService] Notifying listeners about category ${categoryId} deletion`);
    notifyListeners(updatedData);
    
    return true;
  } catch (err: any) {
    console.error(`[PriceService] Error in deleteCategory for ${categoryId}:`, err);
    return false;
  }
}
