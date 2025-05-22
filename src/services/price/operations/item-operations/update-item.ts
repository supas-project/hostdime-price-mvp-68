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
      console.log(`[updateItem] Original price value: ${updates.price} (${typeof updates.price})`);
      
      if (typeof updates.price !== 'number' || isNaN(updates.price)) {
        try {
          // If it's a string with comma as decimal separator (Brazilian format)
          if (typeof updates.price === 'string') {
            const normalizedPrice = updates.price
              .replace(/\./g, '') // Remove dots (thousand separators)
              .replace(',', '.'); // Replace comma with dot (decimal separator)
            
            updates.price = parseFloat(normalizedPrice);
          } else {
            updates.price = Number(updates.price);
          }
          
          // If still NaN after conversion, use original price
          if (isNaN(updates.price)) {
            console.error(`[updateItem] Price conversion failed, using original price`);
            updates.price = allData[categoryId].items[itemIndex].price;
          }
          
          console.log(`[updateItem] Converted price to number: ${updates.price}`);
        } catch (error) {
          console.error(`[updateItem] Failed to convert price: ${error}`);
          // Keep the original price
          updates.price = allData[categoryId].items[itemIndex].price;
        }
      }
      
      // Ensure we always have a valid number with at most 2 decimal places
      if (typeof updates.price === 'number' && !isNaN(updates.price)) {
        // Leave the full precision but log the rounded value for debugging
        const roundedForDisplay = Math.round(updates.price * 100) / 100;
        console.log(`[updateItem] Final price value for ${itemId}: ${updates.price} (rounded for display: ${roundedForDisplay})`);
      }
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
    console.error(`[updateItem] Error updating ${itemId} in ${categoryId}:`, err);
    return null;
  }
}
