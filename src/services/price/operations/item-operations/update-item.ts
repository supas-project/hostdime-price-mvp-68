
import { PriceItem } from '@/types/pricing';
import { saveData } from '../../operations/data-persistence';
import { PriceService } from '@/services/price-service';
import { notifyListeners } from '../../listeners';

/**
 * Updates an existing item in a category
 */
export async function updateItem(categoryId: string, itemId: string, updates: Partial<PriceItem>): Promise<PriceItem | null> {
  try {
    console.log(`[updateItem] Updating item ${itemId} in category ${categoryId} with:`, updates);
    
    // Get all data
    const allData = await PriceService.getAllData();
    
    // Find the category
    if (!allData[categoryId]) {
      console.error(`Category ${categoryId} not found`);
      return null;
    }
    
    // Find the item index
    const itemIndex = allData[categoryId].items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      console.error(`Item ${itemId} not found in category ${categoryId}`);
      return null;
    }
    
    // Get the current item to ensure we don't lose data
    const currentItem = allData[categoryId].items[itemIndex];
    console.log(`[updateItem] Current item before update:`, currentItem);
    
    // Create the updated item ensuring we keep existing properties
    const updatedItem = {
      ...currentItem,
      ...updates,
      // Explicitly preserve capacity field at root level
      capacity: updates.capacity || currentItem.capacity,
      // Explicitly preserve subtype field at root level
      subtype: updates.subtype || currentItem.subtype,
      // Ensure metadata is properly merged, not overwritten
      metadata: {
        ...(currentItem.metadata || {}),
        ...(updates.metadata || {}),
        // Explicitly preserve disk-specific metadata
        type: updates.type || currentItem.type,
        subtype: updates.subtype || (currentItem.metadata?.subtype || currentItem.subtype),
        capacity: updates.capacity || (currentItem.metadata?.capacity || currentItem.capacity),
      }
    };
    
    console.log(`[updateItem] Updated item after merging:`, updatedItem);
    
    // Update the items array
    const updatedItems = [...allData[categoryId].items];
    updatedItems[itemIndex] = updatedItem;
    
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
    console.log(`[updateItem] Successfully saved updated data for item ${itemId}`);

    // Notify listeners about the changes
    notifyListeners(updatedData);
    
    return updatedItem;
  } catch (err: any) {
    console.error(`Error in updateItem for ${itemId} in ${categoryId}:`, err);
    return null;
  }
}
