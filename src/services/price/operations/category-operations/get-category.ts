
import { PriceCategory } from '@/types/pricing';
import { getAllData } from '../data-retrieval';

/**
 * Gets a specific category by ID
 */
export async function getCategory(categoryId: string): Promise<PriceCategory | null> {
  try {
    console.log(`[PriceService] Getting category: ${categoryId}`);
    const allData = await getAllData();
    
    if (!allData || !allData[categoryId]) {
      console.warn(`[PriceService] Category ${categoryId} not found`);
      return null;
    }
    
    console.log(`[PriceService] Found category ${categoryId} with ${allData[categoryId].items?.length || 0} items`);
    return allData[categoryId];
  } catch (err: any) {
    console.error(`[PriceService] Error in getCategory for ${categoryId}:`, err);
    return null;
  }
}
