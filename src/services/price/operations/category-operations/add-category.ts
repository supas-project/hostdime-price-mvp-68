
import { PriceCategory } from '@/types/pricing';
import { v4 as uuidv4 } from 'uuid';
import { saveData } from '../data-persistence';
import { PriceService } from '@/services/price-service';
import { notifyListeners } from '../../listeners';

/**
 * Adds a new category to the price data
 */
export async function addCategory(category: Omit<PriceCategory, "items">): Promise<PriceCategory> {
  try {
    const newCategoryId = category.id || uuidv4();
    const newCategory: PriceCategory = { 
      id: newCategoryId, 
      name: category.name,
      items: [] 
    };

    // Get all existing data
    const allData = await PriceService.getAllData();
    
    // Add the new category
    const updatedData = {
      ...allData,
      [newCategoryId]: newCategory
    };

    // Save the updated data
    await saveData(updatedData);
    
    notifyListeners();
    return newCategory;
  } catch (err: any) {
    console.error("Error in addCategory:", err);
    throw new Error(err.message || "Failed to add category.");
  }
}
