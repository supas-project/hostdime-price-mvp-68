
import { PriceCategory } from '@/types/pricing';
import { saveData } from '../data-persistence';
import { getAllData } from '../data-retrieval';
import { notifyListeners } from '../../listeners';

/**
 * Updates an existing category with new data
 */
export async function updateCategory(categoryId: string, updates: Partial<PriceCategory>): Promise<PriceCategory | null> {
  try {
    // Get all existing data
    const allData = await getAllData();
    
    // Find the category to update
    if (!allData[categoryId]) {
      console.error(`Category ${categoryId} not found`);
      return null;
    }
    
    // Update the category
    const updatedCategory: PriceCategory = {
      ...allData[categoryId],
      ...updates
    };
    
    const updatedData = {
      ...allData,
      [categoryId]: updatedCategory
    };
    
    // Save the updated data
    await saveData(updatedData);
    
    notifyListeners();
    return updatedCategory;
  } catch (err: any) {
    console.error(`Error in updateCategory for ${categoryId}:`, err);
    return null;
  }
}
