
import { PriceCategory } from '@/types/pricing';
import { getAllData } from '../data-retrieval';

/**
 * Gets a specific category by ID
 */
export async function getCategory(categoryId: string): Promise<PriceCategory | null> {
  try {
    console.log(`[PriceService] Getting category: ${categoryId}`);
    const allData = await getAllData();
    
    if (!allData) {
      console.warn(`[PriceService] No data available when fetching category ${categoryId}`);
      return null;
    }
    
    // Verificação direta pelo ID (case insensitive)
    const normalizedCategoryId = categoryId.toLowerCase();
    
    // Log para debug de todas as categorias disponíveis
    console.log(`[PriceService] Available categories: ${Object.keys(allData).join(', ')}`);
    
    // Primeiro, tentamos encontrar diretamente pela chave do objeto
    if (allData[categoryId]) {
      console.log(`[PriceService] Found category ${categoryId} by exact ID match with ${allData[categoryId].items?.length || 0} items`);
      
      // Garantir que items seja sempre um array
      if (!Array.isArray(allData[categoryId].items)) {
        console.warn(`[PriceService] Items for category ${categoryId} is not an array, fixing`);
        allData[categoryId].items = allData[categoryId].items || [];
      }
      
      return {
        ...allData[categoryId],
        items: allData[categoryId].items || []
      };
    }
    
    // Busca alternativa: percorrer todas as categorias procurando por correspondências
    for (const [key, category] of Object.entries(allData)) {
      if (
        key.toLowerCase() === normalizedCategoryId || 
        (category.id && category.id.toLowerCase() === normalizedCategoryId) || 
        (category.name && category.name.toLowerCase() === normalizedCategoryId)
      ) {
        console.log(`[PriceService] Found category by alternative match: ${key} with ${category.items?.length || 0} items`);
        
        // Garantir que items seja sempre um array
        if (!Array.isArray(category.items)) {
          console.warn(`[PriceService] Items for category ${key} is not an array, fixing...`);
          category.items = category.items || [];
        }
        
        return {
          ...category,
          items: category.items || []
        };
      }
    }
    
    // Tentativa especial para storage e external_storage
    if (normalizedCategoryId === 'storage' && allData.external_storage) {
      console.log(`[PriceService] Falling back to external_storage for storage request`);
      return getCategory('external_storage');
    }
    
    if (normalizedCategoryId === 'external_storage' && allData.storage) {
      console.log(`[PriceService] Falling back to storage for external_storage request`);
      return getCategory('storage');
    }
    
    console.warn(`[PriceService] Category ${categoryId} not found after all search attempts`);
    return null;
  } catch (err: any) {
    console.error(`[PriceService] Error in getCategory for ${categoryId}:`, err);
    return null;
  }
}
