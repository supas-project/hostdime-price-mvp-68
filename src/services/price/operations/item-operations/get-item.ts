
import { PriceItem } from '@/types/pricing';
import { getAllData } from '../data-retrieval';
import { getCategory } from '../category-operations/get-category';

/**
 * Gets a specific item by ID from a category
 */
export async function getItem(categoryId: string, itemId: string): Promise<PriceItem | null> {
  try {
    console.log(`[PriceService] Getting item ${itemId} from category ${categoryId}`);
    
    // Obter a categoria usando a função específica que já contém lógica de busca aprimorada
    const category = await getCategory(categoryId);
    
    if (!category) {
      console.warn(`[PriceService] Category ${categoryId} not found when fetching item ${itemId}`);
      
      // Tentativa alternativa para storage/external_storage
      if (categoryId.toLowerCase() === 'storage') {
        console.log('[PriceService] Trying to find item in external_storage instead');
        return getItem('external_storage', itemId);
      } else if (categoryId.toLowerCase() === 'external_storage') {
        console.log('[PriceService] Trying to find item in storage instead');
        return getItem('storage', itemId);
      }
      
      const allData = await getAllData();
      console.log(`[PriceService] Available categories: ${Object.keys(allData).join(', ')}`);
      return null;
    }
    
    // Garantir que temos um array de itens
    if (!category.items) {
      console.error(`[PriceService] Items is missing for category ${categoryId}`);
      category.items = [];
      return null;
    }
    
    if (!Array.isArray(category.items)) {
      console.error(`[PriceService] Items is not an array for category ${categoryId}, it is: ${typeof category.items}`);
      return null;
    }
    
    console.log(`[PriceService] Searching for item ${itemId} among ${category.items.length} items`);
    
    // Encontrar o item pelo ID (considerar correspondências exatas e parciais)
    const item = category.items.find(item => 
      item?.id === itemId || 
      (item?.id && item.id.toLowerCase() === itemId.toLowerCase())
    );
    
    if (item) {
      console.log(`[PriceService] Item found: ${item.name}`);
    } else {
      console.log(`[PriceService] Item ${itemId} not found in category ${categoryId}`);
      
      // Log all item IDs for debugging
      if (category.items.length > 0) {
        console.log(`[PriceService] Available item IDs in ${categoryId}: ${category.items.map(i => i.id).join(', ')}`);
      }
    }
    
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
    
    // Obter a categoria usando a função específica
    const category = await getCategory(categoryId);
    
    if (!category) {
      console.warn(`[PriceService] Category ${categoryId} not found when listing items`);
      
      // Tentativa alternativa para storage/external_storage
      if (categoryId.toLowerCase() === 'storage') {
        console.log('[PriceService] Trying to find items in external_storage instead');
        return getCategoryItems('external_storage');
      } else if (categoryId.toLowerCase() === 'external_storage') {
        console.log('[PriceService] Trying to find items in storage instead');
        return getCategoryItems('storage');
      }
      
      const allData = await getAllData();
      console.log(`[PriceService] Available categories: ${Object.keys(allData).join(', ')}`);
      return [];
    }
    
    // Garantir que temos um array de itens
    if (!category.items) {
      console.warn(`[PriceService] Items is missing for category ${categoryId}, returning empty array`);
      return [];
    }
    
    if (!Array.isArray(category.items)) {
      console.warn(`[PriceService] Items is not an array for category ${categoryId}, returning empty array`);
      return [];
    }
    
    console.log(`[PriceService] Found ${category.items.length} items in category ${categoryId}`);
    
    // Se for storage ou external_storage, faz log detalhado dos itens
    if (categoryId === 'storage' || categoryId === 'external_storage') {
      category.items.forEach(item => {
        console.log(`[PriceService] Item ${item.id}: ${item.name} (type: ${item.type}/${item.subtype || 'unknown'}, price: ${item.price})`);
      });
    }
    
    return category.items;
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
      if (allData[categoryId]) {
        // Garantir que temos um array de itens
        if (!allData[categoryId].items) {
          console.warn(`[PriceService] Items is missing for category ${categoryId}, setting empty array`);
          allData[categoryId].items = [];
        }
        
        if (!Array.isArray(allData[categoryId].items)) {
          console.warn(`[PriceService] Items is not an array for category ${categoryId}, setting empty array`);
          allData[categoryId].items = [];
        }
        
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
