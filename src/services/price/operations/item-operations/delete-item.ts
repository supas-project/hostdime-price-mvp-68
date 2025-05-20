
import { saveData } from '../data-persistence';
import { PriceService } from '@/services/price-service';
import { notifyListeners } from '../../listeners';

/**
 * Deletes an item from a category
 */
export async function deleteItem(categoryId: string, itemId: string): Promise<boolean> {
  try {
    // Get all data
    const allData = await PriceService.getAllData();
    
    // Find the category
    if (!allData[categoryId]) {
      console.error(`Category ${categoryId} not found`);
      return false;
    }
    
    console.log(`[deleteItem] Deleting item ${itemId} from category ${categoryId}`);
    
    // Get item details before deletion for tracking
    const itemToDelete = allData[categoryId].items.find(item => item.id === itemId);
    const itemName = itemToDelete?.name || itemId;
    
    // Filter out the item
    const updatedItems = allData[categoryId].items.filter(item => item.id !== itemId);
    
    // Update the category
    const updatedCategory = {
      ...allData[categoryId],
      items: updatedItems
    };
    
    // Update the data
    const updatedData = {
      ...allData,
      [categoryId]: updatedCategory
    };
    
    // Save the updated data
    await saveData(updatedData);

    // Notify listeners after the deletion
    notifyListeners(updatedData);
    
    // Track this deletion in localStorage to prevent recreation
    try {
      // Mark this item as explicitly deleted in localStorage to prevent recreation
      const deletedItems = JSON.parse(localStorage.getItem('deletedItems') || '{}');
      if (!deletedItems[categoryId]) {
        deletedItems[categoryId] = [];
      }
      
      // Add this item ID to the list if not already there
      if (!deletedItems[categoryId].includes(itemId)) {
        deletedItems[categoryId].push(itemId);
      }
      
      localStorage.setItem('deletedItems', JSON.stringify(deletedItems));
      console.log(`[deleteItem] Item ${itemId} (${itemName}) marked as deleted in localStorage`);
      
      // Dispatch event to notify components of deletion
      window.dispatchEvent(new CustomEvent('item-deleted', {
        detail: { categoryId, itemId }
      }));
    } catch (storageErr) {
      console.warn("Could not update localStorage with deleted item", storageErr);
    }
    
    return true;
  } catch (err: any) {
    console.error(`Error in deleteItem for ${itemId} from ${categoryId}:`, err);
    return false;
  }
}
