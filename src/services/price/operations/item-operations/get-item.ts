
import { PriceItem } from '@/types/pricing';
import { getAllData } from '../data-retrieval';

/**
 * Gets a specific item by ID from a category
 */
export async function getItem(categoryId: string, itemId: string): Promise<PriceItem | null> {
  try {
    // Get all data and find the category
    const allData = await getAllData();
    
    if (!allData[categoryId]) {
      console.warn(`Category ${categoryId} not found when fetching item ${itemId}`);
      return null;
    }
    
    // Find the item in the category
    const item = allData[categoryId].items.find(item => item.id === itemId);
    return item || null;
  } catch (err: any) {
    console.error(`Error in getItem for ${itemId} in ${categoryId}:`, err);
    return null;
  }
}

/**
 * Gets all items from a category
 */
export async function getCategoryItems(categoryId: string): Promise<PriceItem[]> {
  try {
    // Get all data and find the category
    const allData = await getAllData();
    
    if (!allData[categoryId]) {
      console.warn(`Category ${categoryId} not found when listing items`);
      return [];
    }
    
    // Return all items in the category
    return allData[categoryId].items || [];
  } catch (err: any) {
    console.error(`Error in getCategoryItems for ${categoryId}:`, err);
    return [];
  }
}

/**
 * Gets all items from all categories or specified ones
 */
export async function getAllItems(categoryIds?: string[]): Promise<{[key: string]: PriceItem[]}> {
  try {
    // Get all data
    const allData = await getAllData();
    const result: {[key: string]: PriceItem[]} = {};
    
    // Filter by category IDs if specified
    const categories = categoryIds 
      ? Object.keys(allData).filter(id => categoryIds.includes(id))
      : Object.keys(allData);
    
    // Collect items from each category
    for (const categoryId of categories) {
      if (allData[categoryId] && Array.isArray(allData[categoryId].items)) {
        result[categoryId] = allData[categoryId].items;
      } else {
        result[categoryId] = [];
      }
    }
    
    return result;
  } catch (err: any) {
    console.error(`Error in getAllItems:`, err);
    return {};
  }
}
