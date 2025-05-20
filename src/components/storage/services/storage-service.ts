
import { PriceService } from "@/services/price-service";
import { StorageType } from '../types/storage-types';
import { mapPriceItemToStorageType, mapStaticDataToStorageType } from '../utils/storage-mapper';
import { storageData } from '@/data/storage-pricing';
import { toast } from "@/utils/toast-utils";
import { supabase } from "@/integrations/supabase/client";

/**
 * Loads storage types from the price service or falls back to static data
 * @returns A promise that resolves to an array of storage types
 */
export async function loadStorageTypes(): Promise<StorageType[]> {
  try {
    // First check if user is authenticated - use imported supabase client
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session.session;
    
    // If not authenticated, fall back to static data immediately
    if (!isAuthenticated) {
      console.log('[loadStorageTypes] User not authenticated, using static data');
      return storageData.map(mapStaticDataToStorageType);
    }
    
    // Try to force refresh data if authenticated
    try {
      await PriceService.forceRefreshFromLatestSource().catch(error => {
        if (!error.message.includes("Authentication")) {
          console.error('[loadStorageTypes] Error refreshing data:', error);
        }
      });
    } catch (error) {
      // Continue even if refresh fails - we'll try to get existing data
      console.log('[loadStorageTypes] Refresh failed, continuing with existing data');
    }
    
    // Try to get storage category from price service
    try {
      console.log('[loadStorageTypes] Attempting to load storage category');
      const category = await PriceService.getCategory('storage');
      if (category && Array.isArray(category.items) && category.items.length > 0) {
        // Convert price items to storage types
        console.log(`[loadStorageTypes] Found ${category.items.length} storage items in price table`);
        return category.items.map(mapPriceItemToStorageType);
      } else {
        console.warn('[loadStorageTypes] Storage category found, but no items');
      }
    } catch (error) {
      console.error('[loadStorageTypes] Error loading storage types from price service:', error);
    }
    
    // Fallback to static data
    console.log('[loadStorageTypes] Using static storage data as fallback');
    return storageData.map(mapStaticDataToStorageType);
  } catch (error) {
    console.error('[loadStorageTypes] Error loading storage types:', error);
    return storageData.map(mapStaticDataToStorageType);
  }
}
