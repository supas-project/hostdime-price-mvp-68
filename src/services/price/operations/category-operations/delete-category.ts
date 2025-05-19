
import { saveData } from '../../operations';
import { getAllData } from '../../operations';
import { notifyListeners } from '../../listeners';

/**
 * Deletes a category from the price data
 */
export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    // Get all existing data
    const allData = await getAllData();
    
    // Remove the category
    if (!allData[categoryId]) {
      console.error(`Category ${categoryId} not found`);
      return false;
    }
    
    const { [categoryId]: removed, ...updatedData } = allData;
    
    // Save the updated data
    await saveData(updatedData);
    
    notifyListeners();
    return true;
  } catch (err: any) {
    console.error(`Error in deleteCategory for ${categoryId}:`, err);
    return false;
  }
}
