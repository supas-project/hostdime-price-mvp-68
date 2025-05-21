
import { useState, useCallback } from "react";
import { ComponentOption, StorageItems } from "@/types/component";
import { toast } from "sonner";
import { createDiskUniqueKey } from "@/utils/html/price-calculator";

export function useStorageComponents() {
  const [storageItems, setStorageItems] = useState<StorageItems>({
    internal: [],
    external: []
  });

  /**
   * Função centralizada para adicionar ou atualizar um item de armazenamento
   * Usa uma chave única baseada em tipo+capacidade para garantir unicidade
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
      
      // Se o preço for 0, significa que estamos removendo o disco
      if (option.price === 0) {
        const filteredArray = storageArray.filter(disk => disk.id !== option.id);
        updatedStorageItems[storageType] = filteredArray;
        console.log(`[Storage] Removendo disco ${option.id}, restantes: ${filteredArray.length}`);
        return updatedStorageItems;
      }
      
      // Gera uma chave única para o novo disco baseada em tipo+capacidade
      const newItemKey = createDiskUniqueKey(option);
      console.log(`[Storage] Adicionando/atualizando disco com chave única: ${newItemKey}`);
      
      // CORREÇÃO: Remove TODOS os discos existentes com a mesma chave única antes de adicionar o novo
      const filteredArray = storageArray.filter(disk => {
        const existingKey = createDiskUniqueKey(disk);
        const keepDisk = existingKey !== newItemKey;
        if (!keepDisk) {
          console.log(`[Storage] Removendo disco existente com mesma chave: ${disk.id}`);
        }
        return keepDisk;
      });
      
      // Adiciona o novo disco ao array filtrado
      filteredArray.push(option);
      console.log(`[Storage] Array atualizado para ${filteredArray.length} discos do tipo ${storageType}`);
      
      // Atualiza o estado com o array filtrado + novo disco
      updatedStorageItems[storageType] = filteredArray;
      
      return updatedStorageItems;
    });
  }, []);

  /**
   * Função para remover um item de armazenamento específico
   * Suporta remoção por ID ou tipo completo
   */
  const handleRemoveStorageItem = useCallback((type: string) => {
    console.log(`[Storage] Tentando remover: ${type}`);
    
    // Case 1: Remover um disco interno específico
    if (type.startsWith("internal-disk-")) {
      setStorageItems(prev => {
        const updatedInternal = prev.internal.filter(disk => disk.id !== type);
        console.log(`[Storage] Removeu disco interno ${type}, restantes: ${updatedInternal.length}`);
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
    // Importação dinâmica para evitar dependência cíclica
    const { deduplicateStorageItems } = require("@/utils/html/price-calculator");
    
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
    const newDiskKey = createDiskUniqueKey(newDisk);
    
    return storageArray.some(existingDisk => {
      const existingKey = createDiskUniqueKey(existingDisk);
      return existingKey === newDiskKey;
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
