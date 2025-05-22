import { PriceItem } from '@/types/pricing';
import { getAllData } from '../data-retrieval';
import { saveData } from '../data-persistence';
import { notifyListeners } from '../../listeners';

/**
 * Updates an existing item in a category
 */
export async function updateItem(categoryId: string, itemId: string, updates: Partial<PriceItem>): Promise<PriceItem | null> {
  try {
    // Get all data
    const allData = await getAllData();
    
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
    
    // Ensure price is a valid number
    if (updates.price !== undefined) {
      if (typeof updates.price !== 'number') {
        try {
          updates.price = Number(updates.price);
          console.log(`Converted price to number: ${updates.price}`);
        } catch (error) {
          console.error(`Failed to convert price to number: ${updates.price}`);
          // If conversion fails, keep the original price
          updates.price = allData[categoryId].items[itemIndex].price;
        }
      }
      
      // Log the price being saved
      console.log(`[updateItem] Saving price for ${itemId}: ${updates.price}`);
    }
    
    // Update the item
    const updatedItems = [...allData[categoryId].items];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };
    
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

    notifyListeners();
    return updatedItems[itemIndex];
  } catch (err: any) {
    console.error(`Error in updateItem for ${itemId} in ${categoryId}:`, err);
    return null;
  }
}
