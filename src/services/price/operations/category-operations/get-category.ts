
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
    
    // Verificar se a categoria existe diretamente pelo ID
    if (allData[categoryId]) {
      console.log(`[PriceService] Found category ${categoryId} with ${allData[categoryId].items?.length || 0} items`);
      return allData[categoryId];
    }
    
    // Busca alternativa: verificar se existe uma categoria com esse nome
    const categoryByName = Object.values(allData).find(cat => 
      cat.name.toLowerCase() === categoryId.toLowerCase() ||
      cat.id.toLowerCase() === categoryId.toLowerCase()
    );
    
    if (categoryByName) {
      console.log(`[PriceService] Found category by name: ${categoryId} with ${categoryByName.items?.length || 0} items`);
      return categoryByName;
    }
    
    console.warn(`[PriceService] Category ${categoryId} not found`);
    return null;
  } catch (err: any) {
    console.error(`[PriceService] Error in getCategory for ${categoryId}:`, err);
    return null;
  }
}
