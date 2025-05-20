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
      if (categoryId === 'storage' || categoryId === 'external_storage') {
        console.log('[PriceService] Trying to find item in disk category as fallback');
        const diskItem = await getItem('disk', itemId.replace(`${categoryId}-`, ''));
        if (diskItem) {
          // Adaptar o item de disco para storage
          const storageItem: PriceItem = {
            ...diskItem,
            id: itemId,
            type: 'storage',
            subtype: categoryId === 'external_storage' ? 'external' : 'block',
            description: diskItem.description || `${diskItem.name} - ${categoryId === 'external_storage' ? 'Storage externo' : 'Armazenamento'}`
          };
          
          console.log(`[PriceService] Successfully adapted disk item to ${categoryId} format`);
          return storageItem;
        }
      }
      
      // Exibir categorias disponíveis para debug
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
      (item?.id && item.id.includes(itemId)) ||
      (itemId.includes(item?.id || ''))
    );
    
    if (item) {
      console.log(`[PriceService] Item found: ${item.name}`);
    } else {
      console.log(`[PriceService] Item ${itemId} not found in category ${categoryId}`);
      
      // Log all item IDs for debugging
      if (category.items.length > 0) {
        console.log(`[PriceService] Available item IDs in ${categoryId}: ${category.items.map(i => i?.id).join(', ')}`);
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
      
      // Para storage e external_storage, tentar criar itens a partir da categoria disk
      if (categoryId === 'storage' || categoryId === 'external_storage') {
        console.log(`[PriceService] Trying to create ${categoryId} items from disk category`);
        
        const allData = await getAllData();
        const diskItems = allData.disk?.items || [];
        
        if (diskItems.length > 0) {
          const isExternal = categoryId === 'external_storage';
          
          const filteredItems = diskItems
            .filter(item => {
              if (isExternal) {
                return item.type === 'external' || item.subtype === 'external';
              } else {
                return item.type === 'internal' || !item.type;
              }
            })
            .map(item => ({
              ...item,
              id: `${categoryId}-${item.id}`,
              type: 'storage',
              subtype: isExternal ? 'external' : 'block',
              description: item.description || `${item.name} - ${isExternal ? 'Storage externo' : 'Armazenamento'}`
            }));
            
          if (filteredItems.length > 0) {
            console.log(`[PriceService] Created ${filteredItems.length} ${categoryId} items from disk`);
            return filteredItems;
          }
        }
      }
      
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
