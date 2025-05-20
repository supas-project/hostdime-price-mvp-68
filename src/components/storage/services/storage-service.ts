
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
      const storageCategory = await PriceService.getCategory('storage');
      
      if (storageCategory) {
        // Verificar se os itens estão na estrutura correta
        if (!Array.isArray(storageCategory.items)) {
          console.error('[loadStorageTypes] Storage category items is not an array:', storageCategory.items);
          storageCategory.items = [];
        }
        
        if (storageCategory.items.length > 0) {
          // Converter itens de preço para tipos de armazenamento
          console.log(`[loadStorageTypes] Found ${storageCategory.items.length} storage items in price table`);
          return storageCategory.items.map(mapPriceItemToStorageType);
        } else {
          console.warn('[loadStorageTypes] Storage category found, but no items');
        }
      } else {
        console.warn('[loadStorageTypes] Storage category not found, trying external_storage');
        
        // Tentar obter a categoria external_storage como alternativa
        const externalStorageCategory = await PriceService.getCategory('external_storage');
        
        if (externalStorageCategory) {
          // Verificar se os itens estão na estrutura correta
          if (!Array.isArray(externalStorageCategory.items)) {
            console.error('[loadStorageTypes] External storage category items is not an array:', externalStorageCategory.items);
            externalStorageCategory.items = [];
          }
          
          if (externalStorageCategory.items.length > 0) {
            console.log(`[loadStorageTypes] Found ${externalStorageCategory.items.length} external storage items`);
            return externalStorageCategory.items.map(mapPriceItemToStorageType);
          } else {
            console.warn('[loadStorageTypes] External storage category found, but no items');
          }
        } else {
          console.warn('[loadStorageTypes] Neither storage nor external_storage categories found');
        }
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
