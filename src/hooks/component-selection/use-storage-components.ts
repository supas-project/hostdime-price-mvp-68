
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
      let updatedStorageItems;
      
      if (storageType === 'internal') {
        // Se o preço for 0, significa que estamos removendo o disco
        if (option.price === 0) {
          updatedStorageItems = {
            ...prev,
            internal: prev.internal.filter(disk => disk.id !== option.id)
          };
        } else {
          // Verificar se já existe um disco com o mesmo ID
          const existingDiskIndex = prev.internal.findIndex(disk => disk.id === option.id);
          
          if (existingDiskIndex >= 0) {
            // Atualizar o disco existente em vez de adicionar um novo
            const updatedItems = [...prev.internal];
            updatedItems[existingDiskIndex] = option;
            
            updatedStorageItems = {
              ...prev,
              internal: updatedItems
            };
          } else {
            // Adicionar novo disco
            updatedStorageItems = {
              ...prev,
              internal: [...prev.internal, option]
            };
          }
        }
      } else {
        // Para storage externo, mantemos apenas um item
        updatedStorageItems = {
          ...prev,
          external: option.price === 0 ? [] : [option]
        };
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
