
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
    
    // Obter a categoria disk
    const diskCategory = await PriceService.getCategory('disk');
    if (!diskCategory || !diskCategory.items || diskCategory.items.length === 0) {
      console.log('[tryGetStorageItemsFromDisk] Sem itens de disco disponíveis');
      return [];
    }
    
    const diskItems = diskCategory.items;
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
    
    // Primeiro tente obter itens das categorias de armazenamento diretamente
    let storageItems = [];
    let externalStorageItems = [];
    
    // Verificar diretamente as categorias no objeto allData
    if (allData.storage?.items?.length > 0) {
      console.log(`[loadStorageTypes] Found ${allData.storage.items.length} storage items directly`);
      storageItems = allData.storage.items;
    }
    
    if (allData.external_storage?.items?.length > 0) {
      console.log(`[loadStorageTypes] Found ${allData.external_storage.items.length} external_storage items directly`);
      externalStorageItems = allData.external_storage.items;
    }
    
    // Se não encontramos itens, tente obter através do método getCategory
    if (storageItems.length === 0) {
      try {
        const storageCategory = await PriceService.getCategory('storage');
        if (storageCategory && Array.isArray(storageCategory.items) && storageCategory.items.length > 0) {
          console.log(`[loadStorageTypes] Found ${storageCategory.items.length} storage items via getCategory`);
          storageItems = storageCategory.items;
        }
      } catch (error) {
        console.warn('[loadStorageTypes] Error getting storage category:', error);
      }
    }
    
    if (externalStorageItems.length === 0) {
      try {
        const externalCategory = await PriceService.getCategory('external_storage');
        if (externalCategory && Array.isArray(externalCategory.items) && externalCategory.items.length > 0) {
          console.log(`[loadStorageTypes] Found ${externalCategory.items.length} external_storage items via getCategory`);
          externalStorageItems = externalCategory.items;
        }
      } catch (error) {
        console.warn('[loadStorageTypes] Error getting external_storage category:', error);
      }
    }
    
    // Combine both storage types
    const combinedItems = [...storageItems, ...externalStorageItems];
    
    // Se temos itens combinados, use-os
    if (combinedItems.length > 0) {
      console.log(`[loadStorageTypes] Using ${combinedItems.length} combined storage items`);
      
      // Map items to storage types
      const mappedItems = combinedItems.map(item => {
        try {
          return mapPriceItemToStorageType(item);
        } catch (error) {
          console.error(`[loadStorageTypes] Error mapping item ${item.id}:`, error);
          return null;
        }
      }).filter(Boolean);
      
      if (mappedItems.length > 0) {
        console.log(`[loadStorageTypes] Successfully mapped ${mappedItems.length} storage items`);
        return mappedItems;
      }
    }
    
    // Se ainda não encontrou itens, tente obtê-los da categoria 'disk'
    console.log('[loadStorageTypes] No storage items found, trying disk category');
    const diskStorageItems = await tryGetStorageItemsFromDisk();
    
    if (diskStorageItems.length > 0) {
      console.log(`[loadStorageTypes] Successfully converted ${diskStorageItems.length} disk items to storage types`);
      return diskStorageItems;
    }
    
    // Último recurso: usar dados estáticos
    console.log('[loadStorageTypes] No storage items found anywhere, using static storage data');
    return storageData.map(mapStaticDataToStorageType);
  } catch (error) {
    console.error('[loadStorageTypes] Error loading storage types:', error);
    toast.error('Erro ao carregar tipos de armazenamento', { 
      description: 'Usando dados estáticos como fallback.'
    });
    return storageData.map(mapStaticDataToStorageType);
  }
}
