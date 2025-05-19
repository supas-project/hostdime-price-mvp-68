
import { PriceService } from "@/services/price-service";
import { StorageType } from '../types/storage-types';
import { mapPriceItemToStorageType, mapStaticDataToStorageType } from '../utils/storage-mapper';
import { storageData } from '@/data/storage-pricing';
import { toast } from "sonner";

/**
 * Loads storage types from the price service or falls back to static data
 * @returns A promise that resolves to an array of storage types
 */
export async function loadStorageTypes(): Promise<StorageType[]> {
  try {
    // Primeiro, atualizar os dados do serviço de preços
    await PriceService.forceRefreshFromLatestSource().catch(error => {
      console.error('[loadStorageTypes] Erro ao atualizar dados:', error);
    });
    
    // Try to get storage category from price service
    try {
      console.log('[loadStorageTypes] Tentando carregar categoria de armazenamento');
      const category = await PriceService.getCategory('storage');
      if (category && Array.isArray(category.items) && category.items.length > 0) {
        // Convert price items to storage types
        console.log(`[loadStorageTypes] Encontrados ${category.items.length} itens de armazenamento na tabela de preços`);
        return category.items.map(mapPriceItemToStorageType);
      } else {
        console.warn('[loadStorageTypes] Categoria storage encontrada, mas sem itens');
      }
    } catch (error) {
      console.error('[loadStorageTypes] Erro ao carregar tipos de armazenamento do serviço de preços:', error);
    }
    
    // Fallback to static data
    console.log('[loadStorageTypes] Usando dados estáticos de armazenamento como fallback');
    toast.warning("Usando dados estáticos de armazenamento", {
      description: "Os dados da tabela de preços não estão disponíveis."
    });
    return storageData.map(mapStaticDataToStorageType);
  } catch (error) {
    console.error('[loadStorageTypes] Erro ao carregar tipos de armazenamento:', error);
    return [];
  }
}
