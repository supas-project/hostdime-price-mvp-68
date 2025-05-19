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
    const externalStorageCategory = await initExternalStorageData();
    if (externalStorageCategory) {
      updatedData.external_storage = externalStorageCategory;
      hasChanges = true;
    }
    
    // Process connectivity to ensure port speed and IP blocks are available
    await ensureConnectivityCategories(updatedData);
    
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
 * Ensure Connectivity Categories (Port Speed and IP Blocks) Exist
 * This is specially needed for the "Velocidade de Porta" and "Bloco de IPs" categories
 */
async function ensureConnectivityCategories(data: PriceData): Promise<void> {
  try {
    console.log('[ComponentSync] Checking connectivity categories');
    
    // Find connectivity component in server data
    const connectivityComponent = serverData.componentes.find(
      component => component.type.toLowerCase() === 'conectividade'
    );
    
    if (!connectivityComponent) {
      console.warn('[ComponentSync] Connectivity component not found in server data');
      return;
    }
    
    // Check for port speed category
    const portSpeedExists = Object.values(data).some(
      category => category.name === 'Velocidade de Porta'
    );
    
    // Check for IP blocks category
    const ipBlocksExists = Object.values(data).some(
      category => category.name === 'Bloco de IPs'
    );
    
    let hasChanges = false;
    
    // Add port speed category if it doesn't exist
    if (!portSpeedExists) {
      console.log('[ComponentSync] Creating Port Speed category');
      const portSpeedItems = connectivityComponent.options
        .filter(option => option.subtype?.toLowerCase() === 'porta')
        .map(option => ({
          id: option.id,
          name: option.name,
          description: option.description,
          price: option.price,
          type: option.type,
          subtype: option.subtype,
          isHardware: true
        }));
      
      // Create and add the category
      data.port_speed = {
        id: 'port_speed',
        name: 'Velocidade de Porta',
        items: portSpeedItems
      };
      
      hasChanges = true;
    }
    
    // Add IP blocks category if it doesn't exist
    if (!ipBlocksExists) {
      console.log('[ComponentSync] Creating IP Blocks category');
      const ipBlockItems = connectivityComponent.options
        .filter(option => option.subtype?.toLowerCase() === 'ip')
        .map(option => ({
          id: option.id,
          name: option.name,
          description: option.description,
          price: option.price,
          type: option.type,
          subtype: option.subtype,
          isHardware: true
        }));
      
      // Create and add the category
      data.ip_blocks = {
        id: 'ip_blocks',
        name: 'Bloco de IPs',
        items: ipBlockItems
      };
      
      hasChanges = true;
    }
    
    // If changes were made, save the updated data
    if (hasChanges) {
      console.log('[ComponentSync] Saving data with connectivity categories');
      await PriceService.saveData(data);
    }
  } catch (error) {
    console.error('[ComponentSync] Error ensuring connectivity categories:', error);
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

/**
 * Clean up duplicate categories in price data
 */
export async function cleanupDuplicateCategories(): Promise<boolean> {
  try {
    console.log('[ComponentSync] Cleaning up duplicate categories');
    
    // Get current data
    const data = await PriceService.getAllData();
    if (!data) {
      console.error('[ComponentSync] No price data available for cleanup');
      return false;
    }
    
    // Normalized categories to detect duplicates by name
    const normalizedCategories: Record<string, string> = {};
    const duplicateIds: string[] = [];
    const normalizedData: PriceData = {};
    
    // First pass: identify duplicates
    for (const [id, category] of Object.entries(data)) {
      // Skip undefined or null categories
      if (!category || !category.name) continue;
      
      const normalizedName = category.name.toLowerCase().trim();
      
      if (normalizedCategories[normalizedName]) {
        // This is a duplicate - mark for removal only if empty or has fewer items
        const existingId = normalizedCategories[normalizedName];
        const existingCategory = data[existingId];
        
        // Keep the one with more items or the first one found
        if (existingCategory.items.length < category.items.length) {
          // The existing one has fewer items, replace it
          duplicateIds.push(existingId);
          normalizedCategories[normalizedName] = id;
        } else {
          // This one has fewer items, mark it as duplicate
          duplicateIds.push(id);
        }
      } else {
        // First time seeing this name, record it
        normalizedCategories[normalizedName] = id;
      }
    }
    
    // If no duplicates found, return early
    if (duplicateIds.length === 0) {
      console.log('[ComponentSync] No duplicate categories found');
      return true;
    }
    
    console.log(`[ComponentSync] Found ${duplicateIds.length} duplicate categories: ${duplicateIds.join(', ')}`);
    
    // Second pass: build clean data without duplicates
    for (const [id, category] of Object.entries(data)) {
      if (!duplicateIds.includes(id)) {
        normalizedData[id] = category;
      }
    }
    
    // Save cleaned data
    await PriceService.saveData(normalizedData);
    console.log('[ComponentSync] Duplicate categories cleaned up successfully');
    
    return true;
  } catch (error) {
    console.error('[ComponentSync] Error cleaning up duplicate categories:', error);
    return false;
  }
}
