
import { useState, useCallback } from "react";
import { ComponentOption, StorageItems } from "@/types/component";
import { toast } from "sonner";
import { createDiskUniqueKey } from "@/utils/html/price-calculator";

export function useStorageComponents() {
  const [storageItems, setStorageItems] = useState<StorageItems>({
    internal: [],
    external: []
  });

  // Função centralizada para adicionar ou atualizar um item de armazenamento
  const handleSelectStorageItem = useCallback((option: ComponentOption, storageType: 'internal' | 'external') => {
    if (!option || !option.id) {
      console.error("Invalid storage option:", option);
      return;
    }

    setStorageItems(prev => {
      const updatedStorageItems = { ...prev };
      const storageArray = storageType === 'internal' ? [...prev.internal] : [...prev.external];
      
      // Se o preço for 0, significa que estamos removendo o disco
      if (option.price === 0) {
        const filteredArray = storageArray.filter(disk => disk.id !== option.id);
        updatedStorageItems[storageType] = filteredArray;
        return updatedStorageItems;
      }
      
      // Cria uma chave única para o item atual
      const newItemKey = createDiskUniqueKey(option);
      
      // Remove qualquer item existente com a mesma chave (tipo+capacidade)
      const filteredArray = storageArray.filter(disk => {
        const existingKey = createDiskUniqueKey(disk);
        return existingKey !== newItemKey;
      });
      
      // Adiciona o novo item
      filteredArray.push(option);
      updatedStorageItems[storageType] = filteredArray;
      
      return updatedStorageItems;
    });
  }, []);

  // Função para remover um item de armazenamento específico
  const handleRemoveStorageItem = useCallback((type: string) => {
    // Check for internal disk IDs (they start with "internal-disk-")
    if (type.startsWith("internal-disk-")) {
      setStorageItems(prev => ({
        ...prev,
        internal: prev.internal.filter(disk => disk.id !== type)
      }));
      return;
    }
    
    // Check for external storage IDs (they start with "external-storage-")
    if (type.startsWith("external-storage-")) {
      setStorageItems(prev => ({
        ...prev,
        external: prev.external.filter(storage => storage.id !== type)
      }));
      return;
    }
    
    // Handle the original storage removal cases
    if (type === "storage_internal") {
      setStorageItems(prev => ({
        ...prev,
        internal: []
      }));
    } else if (type === "storage_external") {
      setStorageItems(prev => ({
        ...prev,
        external: []
      }));
    }
  }, []);

  return {
    storageItems,
    setStorageItems,
    handleSelectStorageItem,
    handleRemoveStorageItem
  };
}
