
import { PriceService } from "@/services/price-service";
import { StorageType } from '../types/storage-types';
import { mapPriceItemToStorageType, mapStaticDataToStorageType } from '../utils/storage-mapper';
import { storageData } from '@/data/storage-pricing';
import { toast } from "@/utils/toast-utils";

/**
 * Loads storage types from the price service or falls back to static data
 * @returns A promise that resolves to an array of storage types
 */
export async function loadStorageTypes(): Promise<StorageType[]> {
  try {
    // First check if user is authenticated
    const { data: session } = await PriceService.supabase.auth.getSession();
    const isAuthenticated = !!session.session;
    
    // Se não estiver autenticado, usa dados estáticos
    if (!isAuthenticated) {
      console.log('[loadStorageTypes] User not authenticated, using static data');
      return storageData.map(mapStaticDataToStorageType);
    }
    
    console.log('[loadStorageTypes] User authenticated, checking Supabase data');
    
    // Try to force refresh data if authenticated
    try {
      await PriceService.forceRefreshFromLatestSource().catch(error => {
        if (!error.message?.includes("Authentication")) {
          console.error('[loadStorageTypes] Error refreshing data:', error);
        }
      });
    } catch (error) {
      // Continue even if refresh fails - we'll try to get existing data
      console.log('[loadStorageTypes] Refresh failed, continuing with existing data');
    }
    
    // Try to get storage items from combined categories
    let storageItems = [];
    
    // Try to get external_storage category first
    try {
      console.log('[loadStorageTypes] Attempting to load external_storage category');
      const externalCategory = await PriceService.getCategory('external_storage');
      
      if (externalCategory && Array.isArray(externalCategory.items) && externalCategory.items.length > 0) {
        console.log(`[loadStorageTypes] Found ${externalCategory.items.length} external storage items`);
        storageItems.push(...externalCategory.items);
      } else {
        console.warn('[loadStorageTypes] No items found in external_storage category');
      }
    } catch (error) {
      console.error('[loadStorageTypes] Error loading external_storage category:', error);
    }
    
    // Then try to get storage category
    try {
      console.log('[loadStorageTypes] Attempting to load storage category');
      const storageCategory = await PriceService.getCategory('storage');
      
      if (storageCategory && Array.isArray(storageCategory.items) && storageCategory.items.length > 0) {
        console.log(`[loadStorageTypes] Found ${storageCategory.items.length} storage items`);
        // Avoid duplicates by checking IDs
        const existingIds = new Set(storageItems.map(item => item.id));
        const newItems = storageCategory.items.filter(item => !existingIds.has(item.id));
        storageItems.push(...newItems);
        console.log(`[loadStorageTypes] Added ${newItems.length} unique storage items`);
      } else {
        console.warn('[loadStorageTypes] No items found in storage category');
      }
    } catch (error) {
      console.error('[loadStorageTypes] Error loading storage category:', error);
    }
    
    // Use the combined items if we found any
    if (storageItems.length > 0) {
      console.log(`[loadStorageTypes] Using ${storageItems.length} combined storage items from price service`);
      console.log('[loadStorageTypes] Item IDs:', storageItems.map(item => item.id).join(', '));
      return storageItems.map(mapPriceItemToStorageType);
    }
    
    // Fallback to static data if no items were found
    console.log('[loadStorageTypes] No storage items found, using static storage data as fallback');
    return storageData.map(mapStaticDataToStorageType);
  } catch (error) {
    console.error('[loadStorageTypes] Error loading storage types:', error);
    return storageData.map(mapStaticDataToStorageType);
  }
}
