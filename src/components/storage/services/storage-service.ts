import { PriceService } from "@/services/price-service";
import { StorageType } from '../types/storage-types';
import { mapPriceItemToStorageType, mapStaticDataToStorageType } from '../utils/storage-mapper';
import { storageData } from '@/data/storage-pricing';
import { toast } from "@/utils/toast-utils";

/**
 * Tenta obter os dados de armazenamento diretamente do disco se necessário
 * Esta é uma medida de emergência para casos em que os dados não estão nas categorias corretas
 */
async function tryGetStorageItemsFromDisk(): Promise<StorageType[]> {
  try {
    console.log('[tryGetStorageItemsFromDisk] Tentando obter dados de armazenamento do disco');
    
    // Obter itens da categoria 'disk'
    // Corrigido: usar getCategory em vez de getCategoryItems, e depois acessar os items
    const diskCategory = await PriceService.getCategory('disk');
    const diskItems = diskCategory?.items || [];
    
    if (!diskItems || diskItems.length === 0) {
      console.log('[tryGetStorageItemsFromDisk] Sem itens de disco disponíveis');
      return [];
    }
    
    console.log(`[tryGetStorageItemsFromDisk] Encontrados ${diskItems.length} itens de disco`);
    
    // Converter itens de disco para o formato StorageType
    const storageTypes = diskItems.map(item => {
      try {
        // Modificar o item para parecer com um item de armazenamento
        const storageItem = {
          ...item,
          type: item.type || 'storage',
          subtype: item.subtype || 'block'
        };
        
        return mapPriceItemToStorageType(storageItem);
      } catch (err) {
        console.error(`[tryGetStorageItemsFromDisk] Erro ao mapear item ${item.id}:`, err);
        return null;
      }
    }).filter(Boolean);
    
    console.log(`[tryGetStorageItemsFromDisk] Convertidos ${storageTypes.length} itens para StorageType`);
    return storageTypes;
  } catch (error) {
    console.error('[tryGetStorageItemsFromDisk] Erro ao obter itens de disco:', error);
    return [];
  }
}

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
    
    // Get all data to see what categories exist
    const allData = await PriceService.getAllData();
    console.log('[loadStorageTypes] Available categories:', Object.keys(allData).join(', '));
    
    // Try to get storage items from combined categories
    let storageItems = [];
    
    // Try to get external_storage category first
    try {
      console.log('[loadStorageTypes] Attempting to load external_storage category');
      const externalCategory = await PriceService.getCategory('external_storage');
      
      if (externalCategory && Array.isArray(externalCategory.items)) {
        if (externalCategory.items.length > 0) {
          console.log(`[loadStorageTypes] Found ${externalCategory.items.length} external storage items`);
          console.log('[loadStorageTypes] External storage items:', externalCategory.items.map(item => item.id).join(', '));
          storageItems.push(...externalCategory.items);
        } else {
          console.warn('[loadStorageTypes] external_storage category exists but has no items');
        }
      } else {
        console.warn('[loadStorageTypes] No valid items found in external_storage category');
      }
    } catch (error) {
      console.error('[loadStorageTypes] Error loading external_storage category:', error);
    }
    
    // Then try to get storage category
    try {
      console.log('[loadStorageTypes] Attempting to load storage category');
      const storageCategory = await PriceService.getCategory('storage');
      
      if (storageCategory && Array.isArray(storageCategory.items)) {
        if (storageCategory.items.length > 0) {
          console.log(`[loadStorageTypes] Found ${storageCategory.items.length} storage items`);
          console.log('[loadStorageTypes] Storage items:', storageCategory.items.map(item => item.id).join(', '));
          
          // Avoid duplicates by checking IDs
          const existingIds = new Set(storageItems.map(item => item.id));
          const newItems = storageCategory.items.filter(item => !existingIds.has(item.id));
          
          if (newItems.length > 0) {
            console.log(`[loadStorageTypes] Adding ${newItems.length} unique storage items`);
            storageItems.push(...newItems);
          } else {
            console.log('[loadStorageTypes] No new unique items found in storage category');
          }
        } else {
          console.warn('[loadStorageTypes] storage category exists but has no items');
        }
      } else {
        console.warn('[loadStorageTypes] No valid items found in storage category');
      }
    } catch (error) {
      console.error('[loadStorageTypes] Error loading storage category:', error);
    }
    
    // Verificação adicional: tente acessar diretamente os itens no allData
    if (storageItems.length === 0) {
      console.log('[loadStorageTypes] Trying direct access to data object for storage items');
      
      if (allData.external_storage?.items?.length > 0) {
        console.log(`[loadStorageTypes] Found ${allData.external_storage.items.length} external storage items via direct access`);
        storageItems.push(...allData.external_storage.items);
      }
      
      if (allData.storage?.items?.length > 0) {
        console.log(`[loadStorageTypes] Found ${allData.storage.items.length} storage items via direct access`);
        
        // Avoid duplicates by checking IDs
        const existingIds = new Set(storageItems.map(item => item.id));
        const newItems = allData.storage.items.filter(item => !existingIds.has(item.id));
        storageItems.push(...newItems);
      }
    }
    
    // Se ainda não encontrou itens, tente obtê-los da categoria 'disk' como último recurso
    if (storageItems.length === 0) {
      console.log('[loadStorageTypes] No storage items found in standard categories, trying disk category');
      const diskStorageItems = await tryGetStorageItemsFromDisk();
      
      if (diskStorageItems.length > 0) {
        console.log(`[loadStorageTypes] Successfully converted ${diskStorageItems.length} disk items to storage types`);
        return diskStorageItems;
      }
    }
    
    // Use the combined items if we found any
    if (storageItems.length > 0) {
      console.log(`[loadStorageTypes] Using ${storageItems.length} combined storage items from price service`);
      console.log('[loadStorageTypes] Item IDs:', storageItems.map(item => item.id).join(', '));
      
      const mappedItems = storageItems.map(item => {
        try {
          return mapPriceItemToStorageType(item);
        } catch (error) {
          console.error(`[loadStorageTypes] Error mapping item ${item.id}:`, error);
          return null;
        }
      }).filter(Boolean); // Remove qualquer null que possa ter sido retornado
      
      console.log(`[loadStorageTypes] Successfully mapped ${mappedItems.length} storage items`);
      return mappedItems;
    }
    
    // Fallback to static data if no items were found
    console.log('[loadStorageTypes] No storage items found, using static storage data as fallback');
    return storageData.map(mapStaticDataToStorageType);
  } catch (error) {
    console.error('[loadStorageTypes] Error loading storage types:', error);
    toast.error('Erro ao carregar tipos de armazenamento', { 
      description: 'Usando dados estáticos como fallback.'
    });
    return storageData.map(mapStaticDataToStorageType);
  }
}
