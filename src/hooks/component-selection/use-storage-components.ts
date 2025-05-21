import { useState, useCallback } from "react";
import { ComponentOption, StorageItems } from "@/types/component";
import { toast } from "sonner";
import { deduplicateStorageItems, generatePossibleKeys } from "@/utils/html/price-calculator";

// Esta função não será mais necessária já que a função generatePossibleKeys agora está sendo exportada
// Mas vamos mantê-la como um fallback no caso de mudanças futuras
function generateKeysLocally(item: ComponentOption): string[] {
  if (!item) return [];
  
  const keys: string[] = [];
  
  // Tenta extrair do nome e subtype
  if (item.name) {
    const nameNormalized = item.name.toLowerCase().trim();
    const subtype = item.subtype?.toLowerCase() || '';
    
    // Encontra números seguidos de GB ou TB
    const capacityMatches = nameNormalized.match(/(\d+)\s*(gb|tb)/i);
    if (capacityMatches) {
      const capacity = capacityMatches[1];
      const unit = capacityMatches[2]?.toUpperCase() || '';
      
      if (subtype && capacity) {
        keys.push(`${subtype}-${capacity}${unit}`);
      }
      
      const typeMatch = nameNormalized.match(/^(ssd|hdd|nvme)/i);
      if (typeMatch) {
        const type = typeMatch[1].toLowerCase();
        keys.push(`${type}-${capacity}${unit}`);
      }
    }
  }
  
  // Se não gerou nenhuma chave, usa o ID
  if (keys.length === 0 && item.id) {
    keys.push(item.id);
  }
  
  return keys;
}

// Usa a função do price-calculator ou nossa implementação local
const getItemKeys = (item: ComponentOption): string[] => {
  // Agora podemos usar diretamente generatePossibleKeys já que ela é exportada
  return generatePossibleKeys(item);
};

export function useStorageComponents() {
  const [storageItems, setStorageItems] = useState<StorageItems>({
    internal: [],
    external: []
  });

  /**
   * CORREÇÃO: Função melhorada para adicionar ou atualizar um item de armazenamento
   * Usa chaves múltiplas para garantir unicidade baseada em tipo+capacidade
   */
  const handleSelectStorageItem = useCallback((option: ComponentOption, storageType: 'internal' | 'external') => {
    if (!option || !option.id) {
      console.error("Invalid storage option:", option);
      return;
    }

    setStorageItems(prev => {
      // Cria uma cópia do estado anterior
      const updatedStorageItems = { ...prev };
      const storageArray = storageType === 'internal' ? [...prev.internal] : [...prev.external];
      
      console.log(`[Storage] Processando ${storageType === 'internal' ? 'disco interno' : 'storage externo'}: ${option.id} - ${option.name}`);
      
      // Se o preço for 0, significa que estamos removendo o disco
      if (option.price === 0) {
        const filteredArray = storageArray.filter(disk => disk.id !== option.id);
        updatedStorageItems[storageType] = filteredArray;
        console.log(`[Storage] Removendo item ${option.id}, restantes: ${filteredArray.length}`);
        return updatedStorageItems;
      }
      
      // CORREÇÃO: Gera múltiplas chaves possíveis para o novo item
      const newItemKeys = getItemKeys(option);
      console.log(`[Storage] Chaves geradas para novo item: `, newItemKeys);
      
      // CORREÇÃO: Remove TODOS os discos existentes que tenham qualquer chave em comum
      const filteredArray = storageArray.filter(disk => {
        const existingKeys = getItemKeys(disk);
        
        // Verifica se há interseção entre as chaves do novo item e do existente
        const hasCommonKey = newItemKeys.some(newKey => 
          existingKeys.some(existingKey => existingKey === newKey)
        );
        
        // Se tiver chave em comum, remover
        if (hasCommonKey) {
          console.log(`[Storage] Removendo item existente com chave semelhante: ${disk.id} - ${disk.name}`);
          return false;
        }
        
        return true;
      });
      
      // Adiciona o novo item ao array filtrado
      filteredArray.push(option);
      console.log(`[Storage] Array atualizado para ${filteredArray.length} itens do tipo ${storageType}`);
      
      // Atualiza o estado com o array filtrado + novo item
      updatedStorageItems[storageType] = filteredArray;
      
      return updatedStorageItems;
    });
  }, []);

  /**
   * CORREÇÃO: Função melhorada para remover um item de armazenamento específico
   * Agora também remove por chave única se o ID exato não for encontrado
   */
  const handleRemoveStorageItem = useCallback((type: string) => {
    console.log(`[Storage] Tentando remover: ${type}`);
    
    // Case 1: Remover um disco interno específico
    if (type.startsWith("internal-disk-")) {
      setStorageItems(prev => {
        // Primeiro tenta remover pelo ID exato
        let updatedInternal = prev.internal.filter(disk => disk.id !== type);
        
        // Se não removeu nenhum (array do mesmo tamanho), tenta remover por chave
        if (updatedInternal.length === prev.internal.length) {
          // Cria chaves para o item que queremos remover baseadas no ID
          const diskTypeParts = type.replace("internal-disk-", "").split("-");
          const diskType = diskTypeParts[0];
          const capacity = diskTypeParts[1];
          
          if (diskType && capacity) {
            const searchKey = `${diskType}-${capacity}`;
            console.log(`[Storage] Tentando remover por chave: ${searchKey}`);
            
            updatedInternal = prev.internal.filter(disk => {
              const keys = getItemKeys(disk);
              return !keys.includes(searchKey);
            });
          }
        }
        
        console.log(`[Storage] Removeu disco(s) interno(s), restantes: ${updatedInternal.length}`);
        return {
          ...prev,
          internal: updatedInternal
        };
      });
      return;
    }
    
    // Case 2: Remover um armazenamento externo específico
    if (type.startsWith("external-storage-")) {
      setStorageItems(prev => {
        const updatedExternal = prev.external.filter(storage => storage.id !== type);
        console.log(`[Storage] Removeu storage externo ${type}, restantes: ${updatedExternal.length}`);
        return {
          ...prev,
          external: updatedExternal
        };
      });
      return;
    }
    
    // Case 3: Remover todos os discos internos
    if (type === "storage_internal") {
      setStorageItems(prev => {
        console.log(`[Storage] Removeu todos os discos internos`);
        return {
          ...prev,
          internal: []
        };
      });
      return;
    } 
    
    // Case 4: Remover todo o armazenamento externo
    if (type === "storage_external") {
      setStorageItems(prev => {
        console.log(`[Storage] Removeu todos os storages externos`);
        return {
          ...prev,
          external: []
        };
      });
      return;
    }
    
    console.log(`[Storage] Nenhuma ação tomada para: ${type}`);
  }, []);

  /**
   * Função para obter discos únicos, sem duplicatas
   * Garantimos que esta função seja sempre chamada ao calcular preços
   */
  const getUniqueStorageItems = useCallback(() => {
    // CORREÇÃO: Deduplica itens diretamente
    const uniqueInternal = deduplicateStorageItems(storageItems.internal);
    const uniqueExternal = deduplicateStorageItems(storageItems.external);
    
    console.log(`[Storage] Discos internos: ${storageItems.internal.length} -> ${uniqueInternal.length} (únicos)`);
    console.log(`[Storage] Storages externos: ${storageItems.external.length} -> ${uniqueExternal.length} (únicos)`);
    
    return {
      internal: uniqueInternal,
      external: uniqueExternal
    };
  }, [storageItems]);

  /**
   * Função auxiliar para verificar se um disco já existe
   * baseado em tipo e capacidade
   */
  const isDiskDuplicate = useCallback((newDisk: ComponentOption, storageType: 'internal' | 'external'): boolean => {
    const storageArray = storageType === 'internal' ? storageItems.internal : storageItems.external;
    const newDiskKeys = getItemKeys(newDisk);
    
    return storageArray.some(existingDisk => {
      const existingKeys = getItemKeys(existingDisk);
      
      // Verifica se há interseção entre as chaves
      return newDiskKeys.some(newKey => 
        existingKeys.some(existingKey => existingKey === newKey)
      );
    });
  }, [storageItems]);

  return {
    // Estados principais
    storageItems,
    setStorageItems,
    
    // Handlers principais
    handleSelectStorageItem,
    handleRemoveStorageItem,
    
    // Funções auxiliares
    getUniqueStorageItems,
    isDiskDuplicate
  };
}
