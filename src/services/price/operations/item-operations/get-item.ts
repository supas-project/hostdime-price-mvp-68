
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
      
      // Tentativa alternativa para categorias especiais
      if (["storage", "external_storage", "memory", "processor", "sistemaoperacional"].includes(categoryId)) {
        // Tentar encontrar o item em outras categorias relacionadas
        const relatedCategories = getCrossReferenceCategories(categoryId);
        
        for (const relatedCategory of relatedCategories) {
          console.log(`[PriceService] Trying to find item in ${relatedCategory} category as fallback`);
          
          const item = await getItemFromRelatedCategory(relatedCategory, itemId, categoryId);
          if (item) {
            console.log(`[PriceService] Found item in ${relatedCategory} and adapted to ${categoryId}`);
            return item;
          }
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
      
      // Tentar buscar itens de categorias relacionadas
      if (["storage", "external_storage", "memory", "processor", "sistemaoperacional"].includes(categoryId)) {
        const relatedCategories = getCrossReferenceCategories(categoryId);
        
        for (const relatedCategory of relatedCategories) {
          console.log(`[PriceService] Trying to create ${categoryId} items from ${relatedCategory} category`);
          
          const items = await getCrossReferenceItems(relatedCategory, categoryId);
          if (items.length > 0) {
            console.log(`[PriceService] Created ${items.length} ${categoryId} items from ${relatedCategory}`);
            return items;
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
    
    // Se for uma categoria especial, faz log detalhado dos itens
    if (["storage", "external_storage", "disk", "memory", "processor", "sistemaoperacional"].includes(categoryId)) {
      category.items.forEach(item => {
        console.log(`[PriceService] Item ${item.id}: ${item.name} (type: ${item.type || 'unknown'}/${item.subtype || 'unknown'}, price: ${item.price})`);
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

/**
 * Helper function to get cross-reference categories for a given category
 */
function getCrossReferenceCategories(categoryId: string): string[] {
  const categoryMap: Record<string, string[]> = {
    'storage': ['disk'],
    'external_storage': ['disk', 'storage'],
    'disk': ['storage', 'external_storage'],
    'memory': ['memória'],
    'memória': ['memory'],
    'processor': ['processador'],
    'processador': ['processor'],
    'sistemaoperacional': ['os', 'operatingsystem'],
    'os': ['sistemaoperacional'],
    'operatingsystem': ['sistemaoperacional']
  };

  return categoryMap[categoryId] || [];
}

/**
 * Helper function to get items from a related category
 */
async function getItemFromRelatedCategory(
  relatedCategoryId: string, 
  itemId: string, 
  targetCategoryId: string
): Promise<PriceItem | null> {
  const allData = await getAllData();
  if (!allData[relatedCategoryId]?.items) {
    return null;
  }

  // Tentar encontrar o item na categoria relacionada
  const relatedItems = allData[relatedCategoryId].items;
  let sanitizedItemId = itemId.replace(`${targetCategoryId}-`, '');
  
  // Procurar por correspondências em IDs
  const relatedItem = relatedItems.find(item => 
    item?.id === sanitizedItemId || 
    itemId.includes(item?.id || '') || 
    (item?.id && item.id.includes(sanitizedItemId))
  );
  
  if (!relatedItem) return null;
  
  // Adaptar o item para o formato da categoria alvo
  return {
    ...relatedItem,
    id: itemId,
    type: getDefaultTypeForCategory(targetCategoryId),
    subtype: getDefaultSubtypeForCategory(targetCategoryId),
    description: relatedItem.description || `${relatedItem.name} - ${getCategoryDisplayName(targetCategoryId)}`
  };
}

/**
 * Helper function to get items from a cross-reference category
 */
async function getCrossReferenceItems(
  relatedCategoryId: string, 
  targetCategoryId: string
): Promise<PriceItem[]> {
  const allData = await getAllData();
  if (!allData[relatedCategoryId]?.items || allData[relatedCategoryId].items.length === 0) {
    return [];
  }
  
  // Obter itens da categoria relacionada
  const relatedItems = allData[relatedCategoryId].items;
  
  // Converter os itens para o formato da categoria alvo
  return relatedItems.map(item => ({
    ...item,
    id: `${targetCategoryId}-${item.id}`,
    type: getDefaultTypeForCategory(targetCategoryId),
    subtype: getDefaultSubtypeForCategory(targetCategoryId),
    description: item.description || `${item.name} - ${getCategoryDisplayName(targetCategoryId)}`
  }));
}

/**
 * Helper function to get default type for a category
 */
function getDefaultTypeForCategory(categoryId: string): string {
  const typeMap: Record<string, string> = {
    'storage': 'storage',
    'external_storage': 'storage',
    'disk': 'disk',
    'memory': 'memory',
    'processor': 'cpu',
    'sistemaoperacional': 'os',
    'connectivity': 'network',
    'port_speed': 'network'
  };
  
  return typeMap[categoryId] || categoryId;
}

/**
 * Helper function to get default subtype for a category
 */
function getDefaultSubtypeForCategory(categoryId: string): string {
  const subtypeMap: Record<string, string> = {
    'storage': 'block',
    'external_storage': 'external',
    'disk': 'internal'
  };
  
  return subtypeMap[categoryId] || '';
}

/**
 * Helper function to get display name for a category
 */
function getCategoryDisplayName(categoryId: string): string {
  const displayNames: Record<string, string> = {
    'storage': 'Armazenamento',
    'external_storage': 'Storage Externo',
    'disk': 'Discos',
    'memory': 'Memória',
    'processor': 'Processador',
    'sistemaoperacional': 'Sistema Operacional'
  };
  
  return displayNames[categoryId] || categoryId;
}
