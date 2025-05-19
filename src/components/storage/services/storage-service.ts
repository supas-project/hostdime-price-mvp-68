
import { PriceService } from "@/services/price-service";
import { StorageType } from '../types/storage-types';
import { mapPriceItemToStorageType, mapStaticDataToStorageType } from '../utils/storage-mapper';
import { storageData } from '@/data/storage-pricing';

/**
 * Loads storage types from the price service or falls back to static data
 * @returns A promise that resolves to an array of storage types
 */
export async function loadStorageTypes(): Promise<StorageType[]> {
  try {
    // Try to get storage category from price service
    try {
      const category = await PriceService.getCategory('storage');
      if (category && Array.isArray(category.items) && category.items.length > 0) {
        // Convert price items to storage types
        return category.items.map(mapPriceItemToStorageType);
      }
    } catch (error) {
      console.error('Error loading storage types from price service:', error);
    }
    
    // Fallback to static data
    console.log('Falling back to static storage data');
    return storageData.map(mapStaticDataToStorageType);
  } catch (error) {
    console.error('Error loading storage types:', error);
    return [];
  }
}
