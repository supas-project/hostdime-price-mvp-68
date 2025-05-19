
import { PriceService } from '@/services/price-service';
import { serverData } from '@/data/server-components';
import { diskData } from '@/data/disk-data';
import { storageData } from '@/data/storage-pricing';
import { PriceData, PriceCategory } from '@/types/pricing';
import { 
  createDiskCategory, 
  createExternalStorageCategory, 
  createStorageCategory,
  convertStorageDataItem, 
  convertPriceItemToDisk,
  convertExternalStorageToItem
} from './storage-converter';

/**
 * Initialize server categories from price data
 * This ensures all necessary categories exist and are properly configured
 */
export async function initializeServerCategories(): Promise<boolean> {
  try {
    console.log('[ComponentSync] Initializing server categories');

    // Load price data
    const data = await PriceService.getAllData();
    if (!data) {
      console.error("[ComponentSync] No price data available for initialization");
      return false;
    }
    
    let updatedData = { ...data };
    let hasChanges = false;

    // Ensure storage categories exist
    if (!updatedData.storage) {
      console.log('[ComponentSync] Creating base storage category');
      updatedData.storage = createStorageCategory();
      hasChanges = true;
    }

    // Create/update internal disk category
    const diskCategory = await initInternalDiskData(updatedData);
    if (diskCategory) {
      updatedData.disk = diskCategory;
      hasChanges = true;
    }

    // Create/update external storage category
    const externalStorageCategory = await initExternalStorageData(updatedData);
    if (externalStorageCategory) {
      updatedData.external_storage = externalStorageCategory;
      hasChanges = true;
    }
    
    // Process other server components
    for (const component of serverData.componentes) {
      const normalizedType = component.type.toLowerCase().replace(/\s+/g, '_');
      
      // Skip storage as it's handled separately
      if (normalizedType === 'armazenamento' || normalizedType === 'storage') {
        continue;
      }
      
      // If category doesn't exist, create it
      if (!updatedData[normalizedType]) {
        console.log(`[ComponentSync] Creating category for ${component.type}`);
        updatedData[normalizedType] = {
          id: normalizedType,
          name: component.friendlyName || component.type,
          items: []
        };
        hasChanges = true;
      }
    }

    // Save changes if necessary
    if (hasChanges) {
      console.log('[ComponentSync] Saving updated price data with new categories');
      await PriceService.saveData(updatedData);
    }
    
    console.log('[ComponentSync] Server categories initialized successfully');
    return true;
  } catch (error) {
    console.error('[ComponentSync] Error initializing server categories:', error);
    return false;
  }
}

/**
 * Initialize disk data and synchronize with price service
 */
export async function syncDiskDataWithPriceService(): Promise<boolean> {
  try {
    console.log('[ComponentSync] Synchronizing disk data with price service');
    
    // Get current data
    const priceData = await PriceService.getAllData();
    if (!priceData) {
      console.error('[ComponentSync] No price data available for synchronization');
      return false;
    }
    
    // Initialize categories
    await initializeServerCategories();
    
    return true;
  } catch (error) {
    console.error('[ComponentSync] Error synchronizing disk data:', error);
    return false;
  }
}

/**
 * Initialize external storage data
 */
export async function initExternalStorageData(): Promise<PriceCategory | null> {
  try {
    console.log('[ComponentSync] Initializing external storage data');
    
    // Get current data
    const priceData = await PriceService.getAllData();
    if (!priceData) {
      console.error('[ComponentSync] No price data available');
      return null;
    }
    
    // Check if external storage category exists
    if (!priceData.external_storage) {
      console.log('[ComponentSync] Creating external storage category');
      
      // Create and save the external storage category
      const externalStorageCategory = createExternalStorageCategory();
      
      // Add default external storage options
      externalStorageCategory.items = storageData.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        type: item.type,
        subtype: item.subtype,
        specs: item.specs,
        isHardware: true,
        metadata: {
          features: item.metadata.benefits
        }
      }));
      
      console.log('[ComponentSync] External storage category initialized successfully');
      return externalStorageCategory;
    } else {
      console.log('[ComponentSync] External storage category already exists');
      return null;
    }
  } catch (error) {
    console.error('[ComponentSync] Error initializing external storage data:', error);
    return null;
  }
}

/**
 * Initialize internal disk data
 */
async function initInternalDiskData(data: PriceData): Promise<PriceCategory | null> {
  try {
    // Check if disk data exists in price table
    const existingCategory = data.disk;
    
    // If disk category doesn't exist, create it and populate with default disks
    if (!existingCategory || existingCategory.items.length === 0) {
      console.log('[ComponentSync] Creating disk category with default items');
      
      // Create a new disk category
      const diskCategory = createDiskCategory();
      
      // Add default disks from disk data
      diskCategory.items = diskData.map(disk => convertStorageDataItem(disk));
      
      console.log(`[ComponentSync] Added ${diskCategory.items.length} default disks`);
      return diskCategory;
    }
    
    // Category exists with items, no need to change
    return null;
  } catch (error) {
    console.error('[ComponentSync] Error initializing disk data:', error);
    return null;
  }
}
