
import { PriceCategory } from '@/types/pricing';
import { getAllData } from '../data-retrieval';

/**
 * Gets a specific category by ID
 */
export async function getCategory(categoryId: string): Promise<PriceCategory | null> {
  try {
    console.log(`[PriceService] Getting category: ${categoryId}`);
    
    // Verificar se o ID da categoria está vazio ou é inválido
    if (!categoryId || typeof categoryId !== 'string') {
      console.error(`[PriceService] Invalid category ID: ${categoryId}`);
      return null;
    }
    
    const allData = await getAllData();
    
    if (!allData) {
      console.error(`[PriceService] Failed to get data from Supabase when fetching category ${categoryId}`);
      return null;
    }
    
    // Log para debug de todas as categorias disponíveis
    console.log(`[PriceService] Available categories: ${Object.keys(allData).join(', ')}`);
    
    // Normalizar o ID da categoria para comparação case-insensitive
    const normalizedCategoryId = categoryId.toLowerCase();
    
    // Primeiro, tentamos encontrar diretamente pela chave do objeto
    if (allData[categoryId]) {
      console.log(`[PriceService] Found category ${categoryId} by exact ID match`);
      
      // Garantir que items seja sempre um array
      if (!allData[categoryId].items) {
        console.warn(`[PriceService] Items for category ${categoryId} is missing, adding empty array`);
        allData[categoryId].items = [];
      } else if (!Array.isArray(allData[categoryId].items)) {
        console.warn(`[PriceService] Items for category ${categoryId} is not an array, fixing`);
        allData[categoryId].items = [];
      }
      
      // Verificar número de itens
      console.log(`[PriceService] Category ${categoryId} has ${allData[categoryId].items.length} items`);
      
      return {
        ...allData[categoryId],
        items: allData[categoryId].items || []
      };
    }
    
    // Busca alternativa: percorrer todas as categorias procurando por correspondências
    for (const [key, category] of Object.entries(allData)) {
      if (!category) continue;
      
      if (
        key.toLowerCase() === normalizedCategoryId || 
        (category.id && category.id.toLowerCase() === normalizedCategoryId) || 
        (category.name && category.name.toLowerCase() === normalizedCategoryId)
      ) {
        console.log(`[PriceService] Found category by alternative match: ${key}`);
        
        // Garantir que items seja sempre um array
        if (!category.items) {
          console.warn(`[PriceService] Items for category ${key} is missing, adding empty array`);
          category.items = [];
        } else if (!Array.isArray(category.items)) {
          console.warn(`[PriceService] Items for category ${key} is not an array, fixing`);
          category.items = [];
        }
        
        // Verificar número de itens
        console.log(`[PriceService] Category ${key} has ${category.items?.length || 0} items`);
        
        return {
          ...category,
          items: category.items || []
        };
      }
    }
    
    // Tentativa especial para storage e external_storage
    if (normalizedCategoryId === 'storage' && allData.external_storage) {
      console.log(`[PriceService] Falling back to external_storage for storage request`);
      
      // Verificar número de itens
      console.log(`[PriceService] external_storage has ${allData.external_storage.items?.length || 0} items`);
      
      // Garantir que items seja sempre um array
      if (!allData.external_storage.items) {
        console.warn(`[PriceService] Items for external_storage is missing, adding empty array`);
        allData.external_storage.items = [];
      } else if (!Array.isArray(allData.external_storage.items)) {
        console.warn(`[PriceService] Items for external_storage is not an array, fixing`);
        allData.external_storage.items = [];
      }
      
      return {
        ...allData.external_storage,
        items: allData.external_storage.items || []
      };
    }
    
    if (normalizedCategoryId === 'external_storage' && allData.storage) {
      console.log(`[PriceService] Falling back to storage for external_storage request`);
      
      // Verificar número de itens
      console.log(`[PriceService] storage has ${allData.storage.items?.length || 0} items`);
      
      // Garantir que items seja sempre um array
      if (!allData.storage.items) {
        console.warn(`[PriceService] Items for storage is missing, adding empty array`);
        allData.storage.items = [];
      } else if (!Array.isArray(allData.storage.items)) {
        console.warn(`[PriceService] Items for storage is not an array, fixing`);
        allData.storage.items = [];
      }
      
      return {
        ...allData.storage,
        items: allData.storage.items || []
      };
    }
    
    console.warn(`[PriceService] Category ${categoryId} not found after all search attempts`);
    return null;
  } catch (err: any) {
    console.error(`[PriceService] Error in getCategory for ${categoryId}:`, err);
    return null;
  }
}
