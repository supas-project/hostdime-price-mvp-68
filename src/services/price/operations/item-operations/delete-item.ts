
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
    
    console.log(`[deleteItem] Removing item ${itemId} from ${categoryId}`);
    console.log(`[deleteItem] Before deletion: ${allData[categoryId].items.length} items`);
    
    // Verificar se o item existe antes de tentar remover
    const itemExists = allData[categoryId].items.some(item => item.id === itemId);
    if (!itemExists) {
      console.error(`Item ${itemId} not found in category ${categoryId}`);
      return false;
    }
    
    // Filter out the item - garantindo que removemos exatamente o item com ID correto
    const updatedItems = allData[categoryId].items.filter(item => item.id !== itemId);
    
    console.log(`[deleteItem] After deletion: ${updatedItems.length} items (removed ${allData[categoryId].items.length - updatedItems.length} items)`);
    
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
