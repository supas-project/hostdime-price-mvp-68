
import { useState } from "react";
import { ComponentOption, StorageItems } from "@/types/component";
import { toast } from "sonner";

export function useStorageComponents() {
  const [storageItems, setStorageItems] = useState<StorageItems>({
    internal: [],
    external: []
  });

  const handleSelectStorageItem = (option: ComponentOption, storageType: 'internal' | 'external') => {
    if (!option || !option.id) {
      console.error("Invalid storage option:", option);
      return;
    }

    setStorageItems(prev => {
      const updatedStorageItems = { ...prev };
      
      if (storageType === 'internal') {
        // Se o preço for 0, significa que estamos removendo o disco
        if (option.price === 0) {
          updatedStorageItems.internal = prev.internal.filter(disk => disk.id !== option.id);
          return updatedStorageItems;
        }
        
        // Encontrar o índice do disco (baseado no ID exato)
        const existingIndex = prev.internal.findIndex(disk => disk.id === option.id);
        
        if (existingIndex >= 0) {
          // Substituir o disco existente com as novas informações
          const updatedInternal = [...prev.internal];
          updatedInternal[existingIndex] = option;
          updatedStorageItems.internal = updatedInternal;
        } else {
          // Remover qualquer disco do mesmo tipo e capacidade antes de adicionar
          const diskTypeAndCapacity = option.id.replace('internal-disk-', '');
          const [diskType, capacity] = diskTypeAndCapacity.split('-');
          
          updatedStorageItems.internal = prev.internal.filter(disk => {
            // Manter todos os discos que não correspondem ao mesmo tipo e capacidade
            const diskIdParts = disk.id.replace('internal-disk-', '').split('-');
            return !(diskIdParts[0] === diskType && diskIdParts[1] === capacity);
          });
          
          // Adicionar novo disco
          updatedStorageItems.internal = [...updatedStorageItems.internal, option];
        }
      } else {
        // Para storage externo, substituímos o existente se for do mesmo tipo
        if (option.price === 0) {
          updatedStorageItems.external = [];
        } else {
          const storageType = option.name.split(' ')[1]?.toLowerCase();
          
          // Substituir se já existir um storage do mesmo tipo
          const existingIndex = prev.external.findIndex(storage => 
            storage.name.split(' ')[1]?.toLowerCase() === storageType
          );
          
          if (existingIndex >= 0) {
            const updatedExternal = [...prev.external];
            updatedExternal[existingIndex] = option;
            updatedStorageItems.external = updatedExternal;
          } else {
            updatedStorageItems.external = [...prev.external, option];
          }
        }
      }
      
      return updatedStorageItems;
    });
  };

  const handleRemoveStorageItem = (type: string) => {
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
  };

  return {
    storageItems,
    setStorageItems,
    handleSelectStorageItem,
    handleRemoveStorageItem
  };
}
