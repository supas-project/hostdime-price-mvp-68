
import { getAllData, saveData } from '../../operations';
import { notifyListeners } from '../../listeners';

/**
 * Deletes an item from a category
 */
export async function deleteItem(categoryId: string, itemId: string): Promise<boolean> {
  try {
    // Get all data
    const allData = await getAllData();
    
    // Find the category
    if (!allData[categoryId]) {
      console.error(`Category ${categoryId} not found`);
      return false;
    }
    
    console.log(`[deleteItem] Deleting item ${itemId} from category ${categoryId}`);
    
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
    
    // After successful deletion, update local storage to prevent recreation
    try {
      // Mark this item as explicitly deleted in localStorage to prevent recreation
      const deletedItems = JSON.parse(localStorage.getItem('deletedItems') || '{}');
      if (!deletedItems[categoryId]) {
        deletedItems[categoryId] = [];
      }
      deletedItems[categoryId].push(itemId);
      localStorage.setItem('deletedItems', JSON.stringify(deletedItems));
      
      console.log(`[deleteItem] Item ${itemId} marked as deleted in localStorage`);
    } catch (storageErr) {
      console.warn("Could not update localStorage with deleted item", storageErr);
    }
    
    return true;
  } catch (err: any) {
    console.error(`Error in deleteItem for ${itemId} from ${categoryId}:`, err);
    return false;
  }
}
