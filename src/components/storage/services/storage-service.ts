
import { PriceService } from "@/services/price-service";
import { StorageType } from '../types/storage-types';
import { mapPriceItemToStorageType, mapStaticDataToStorageType } from '../utils/storage-mapper';
import { storageData } from '@/data/storage-pricing';
import { toast } from "@/utils/toast-utils";

/**
 * Converte itens da categoria storage/external_storage para StorageType
 */
async function getStorageItemsFromCategories(): Promise<StorageType[]> {
  try {
    console.log('[getStorageItemsFromCategories] Tentando obter dados das categorias de armazenamento');
    
    // Primeiro tente obter itens das categorias de armazenamento
    const externalStorageCategory = await PriceService.getCategory('external_storage');
    
    if (!externalStorageCategory?.items?.length) {
      console.log('[getStorageItemsFromCategories] Categoria external_storage vazia ou inexistente');
      return [];
    }
    
    console.log(`[getStorageItemsFromCategories] Encontrados ${externalStorageCategory.items.length} itens de storage externo`);
    
    // Converter para StorageType
    const storageTypes = externalStorageCategory.items.map(item => {
      try {
        return mapPriceItemToStorageType(item);
      } catch (err) {
        console.error(`[getStorageItemsFromCategories] Erro ao mapear item ${item.id}:`, err);
        return null;
      }
    }).filter(Boolean);
    
    console.log(`[getStorageItemsFromCategories] Convertidos ${storageTypes.length} itens para StorageType`);
    return storageTypes;
  } catch (error) {
    console.error('[getStorageItemsFromCategories] Erro:', error);
    return [];
  }
}

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
 * Carrega tipos de armazenamento estáticos como último recurso
 */
function loadStaticStorageTypes(): StorageType[] {
  console.log('[loadStaticStorageTypes] Carregando dados estáticos de armazenamento');
  return storageData.map(mapStaticDataToStorageType);
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
      return loadStaticStorageTypes();
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
    
    // ESTRATÉGIA 1: Tentar obter direto das categorias storage/external_storage
    const storageTypes = await getStorageItemsFromCategories();
    if (storageTypes.length > 0) {
      console.log(`[loadStorageTypes] Sucesso! Usando ${storageTypes.length} tipos de armazenamento das categorias`);
      return storageTypes;
    }
    
    // ESTRATÉGIA 2: Tentar processar itens da categoria disk
    console.log('[loadStorageTypes] No storage items found in specialized categories, trying disk category');
    const diskStorageTypes = await tryGetStorageItemsFromDisk();
    
    if (diskStorageTypes.length > 0) {
      console.log(`[loadStorageTypes] Successfully converted ${diskStorageTypes.length} disk items to storage types`);
      return diskStorageTypes;
    }
    
    // ESTRATÉGIA 3: Último recurso - usar dados estáticos
    console.log('[loadStorageTypes] No storage items found anywhere, using static storage data');
    return loadStaticStorageTypes();
  } catch (error) {
    console.error('[loadStorageTypes] Error loading storage types:', error);
    toast.error('Erro ao carregar tipos de armazenamento', { 
      description: 'Usando dados estáticos como fallback.'
    });
    return loadStaticStorageTypes();
  }
}
