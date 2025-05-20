
import { PriceItem } from '@/types/pricing';
import { getAllData } from '../data-retrieval';

/**
 * Gets a specific item by ID from a category
 */
export async function getItem(categoryId: string, itemId: string): Promise<PriceItem | null> {
  try {
    console.log(`[PriceService] Getting item ${itemId} from category ${categoryId}`);
    
    // Get all data and find the category
    const allData = await getAllData();
    
    if (!allData) {
      console.warn(`[PriceService] No data available when fetching item ${itemId}`);
      return null;
    }
    
    if (!allData[categoryId]) {
      console.warn(`[PriceService] Category ${categoryId} not found when fetching item ${itemId}`);
      
      // Tentar encontrar a categoria pelo nome
      const categoryByName = Object.values(allData).find(cat => 
        cat.name.toLowerCase() === categoryId.toLowerCase()
      );
      
      if (!categoryByName) {
        return null;
      }
      
      // Usar a categoria encontrada pelo nome
      const item = categoryByName.items.find(item => item.id === itemId);
      console.log(`[PriceService] Item search in category by name: ${item ? 'Found' : 'Not found'}`);
      return item || null;
    }
    
    // Find the item in the category
    const item = allData[categoryId].items.find(item => item.id === itemId);
    console.log(`[PriceService] Item search result: ${item ? 'Found' : 'Not found'}`);
    return item || null;
  } catch (err: any) {
    console.error(`[PriceService] Error in getItem for ${itemId} in ${categoryId}:`, err);
    return null;
  }
}

/**
 * Gets all items from a category
 */
export async function getCategoryItems(categoryId: string): Promise<PriceItem[]> {
  try {
    console.log(`[PriceService] Getting all items from category ${categoryId}`);
    
    // Get all data and find the category
    const allData = await getAllData();
    
    if (!allData) {
      console.warn(`[PriceService] No data available when listing items for ${categoryId}`);
      return [];
    }
    
    if (!allData[categoryId]) {
      console.warn(`[PriceService] Category ${categoryId} not found when listing items`);
      
      // Tentar encontrar a categoria pelo nome
      const categoryByName = Object.values(allData).find(cat => 
        cat.name.toLowerCase() === categoryId.toLowerCase()
      );
      
      if (!categoryByName) {
        return [];
      }
      
      // Usar a categoria encontrada pelo nome
      console.log(`[PriceService] Found category by name with ${categoryByName.items?.length || 0} items`);
      return categoryByName.items || [];
    }
    
    // Return all items in the category
    console.log(`[PriceService] Found ${allData[categoryId].items?.length || 0} items in category ${categoryId}`);
    return allData[categoryId].items || [];
  } catch (err: any) {
    console.error(`[PriceService] Error in getCategoryItems for ${categoryId}:`, err);
    return [];
  }
}

/**
 * Gets all items from all categories or specified ones
 */
export async function getAllItems(categoryIds?: string[]): Promise<{[key: string]: PriceItem[]}> {
  try {
    console.log(`[PriceService] Getting all items from ${categoryIds ? categoryIds.join(', ') : 'all categories'}`);
    
    // Get all data
    const allData = await getAllData();
    const result: {[key: string]: PriceItem[]} = {};
    
    if (!allData) {
      console.warn(`[PriceService] No data available when getting all items`);
      return {};
    }
    
    // Filter by category IDs if specified
    const categories = categoryIds 
      ? Object.keys(allData).filter(id => categoryIds.includes(id))
      : Object.keys(allData);
    
    console.log(`[PriceService] Processing ${categories.length} categories for items`);
    
    // Collect items from each category
    for (const categoryId of categories) {
      if (allData[categoryId] && Array.isArray(allData[categoryId].items)) {
        result[categoryId] = allData[categoryId].items;
        console.log(`[PriceService] Added ${result[categoryId].length} items from category ${categoryId}`);
      } else {
        result[categoryId] = [];
        console.log(`[PriceService] No items found in category ${categoryId}`);
      }
    }
    
    return result;
  } catch (err: any) {
    console.error(`[PriceService] Error in getAllItems:`, err);
    return {};
  }
}
