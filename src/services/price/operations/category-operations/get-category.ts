
import { PriceCategory } from '@/types/pricing';
import { PriceService } from '@/services/price-service';

/**
 * Gets a specific category by ID from the price data
 */
export async function getCategory(categoryId: string): Promise<PriceCategory | null> {
  try {
    // Get all data and find the category
    const allData = await PriceService.getAllData();
    return allData[categoryId] || null;
  } catch (err: any) {
    console.error(`Error in getCategory for ${categoryId}:`, err);
    return null;
  }
}
