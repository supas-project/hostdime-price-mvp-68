
import { getAllData } from '../data-retrieval';
import { saveData } from '../data-persistence';
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

    notifyListeners();
    return true;
  } catch (err: any) {
    console.error(`Error in deleteItem for ${itemId} from ${categoryId}:`, err);
    return false;
  }
}
