
import { PriceItem, PriceData } from '@/types/pricing';
import { v4 as uuidv4 } from 'uuid';
import { saveData } from '../data-persistence';
import { PriceService } from '@/services/price-service';
import { notifyListeners } from '../../listeners';

/**
 * Adds a new item to a category
 */
export async function addItem(categoryId: string, item: Omit<PriceItem, 'id'>): Promise<PriceItem | null> {
  try {
    const newItemId = uuidv4();
    const itemToAdd = { ...item, id: newItemId };

    // Get all data
    const allData = await PriceService.getAllData();
    
    // Find the category
    if (!allData[categoryId]) {
      console.error(`Category ${categoryId} not found`);
      return null;
    }
    
    // Add the new item to the category's items
    const updatedCategory = {
      ...allData[categoryId],
      items: [...allData[categoryId].items, itemToAdd]
    };
    
    // Update the data
    const updatedData = {
      ...allData,
      [categoryId]: updatedCategory
    };
    
    // Save the updated data
    await saveData(updatedData);

    notifyListeners();
    return itemToAdd as PriceItem;
  } catch (err: any) {
    console.error(`Error in addItem to ${categoryId}:`, err);
    return null;
  }
}
