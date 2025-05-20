
import { PriceItem } from '@/types/pricing';
import { PriceService } from '@/services/price-service';

/**
 * Gets an item by ID from a category
 */
export async function getItem(categoryId: string, itemId: string): Promise<PriceItem | null> {
  try {
    // Get all data
    const allData = await PriceService.getAllData();
    
    // Find the category
    if (!allData[categoryId]) {
      console.error(`Category ${categoryId} not found`);
      return null;
    }
    
    // Find the item
    const item = allData[categoryId].items.find(item => item.id === itemId);
    
    if (!item) {
      console.error(`Item ${itemId} not found in category ${categoryId}`);
      return null;
    }
    
    return item;
  } catch (err: any) {
    console.error(`Error in getItem for ${itemId} from ${categoryId}:`, err);
    return null;
  }
}
