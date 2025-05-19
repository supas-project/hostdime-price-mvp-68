
import { PriceItem, PriceData } from '@/types/pricing';
import { v4 as uuidv4 } from 'uuid';
import { getAllData, saveData } from './data-operations';
import { getCategory } from './category-operations';
import { notifyListeners } from './listeners';

/**
 * Adds a new item to a category
 */
export async function addItem(categoryId: string, item: Omit<PriceItem, 'id'>): Promise<PriceItem | null> {
  try {
    const newItemId = uuidv4();
    const itemToAdd = { ...item, id: newItemId };

    // Get all data
    const allData = await getAllData();
    
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
