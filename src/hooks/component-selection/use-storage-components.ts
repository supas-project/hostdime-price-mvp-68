
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
        
        // Extrair tipo e capacidade do ID do disco
        const diskTypeAndCapacity = option.id.replace('internal-disk-', '');
        const [diskType, capacity] = diskTypeAndCapacity.split('-');
        
        // Remover qualquer disco com o mesmo tipo e capacidade
        updatedStorageItems.internal = prev.internal.filter(disk => {
          if (!disk.id.startsWith('internal-disk-')) return true;
          
          const existingDiskId = disk.id.replace('internal-disk-', '');
          const [existingType, existingCapacity] = existingDiskId.split('-');
          
          return !(existingType === diskType && existingCapacity === capacity);
        });
        
        // Adicionar o novo disco
        updatedStorageItems.internal = [...updatedStorageItems.internal, option];
      } else {
        // Para storage externo, substituímos o existente se for do mesmo tipo
        if (option.price === 0) {
          updatedStorageItems.external = prev.external.filter(storage => storage.id !== option.id);
          return updatedStorageItems;
        }
        
        // Extrair o tipo do nome do storage externo
        const storageType = option.name.split(' ')[1]?.toLowerCase();
        
        // Remover storage existente do mesmo tipo
        updatedStorageItems.external = prev.external.filter(storage => {
          const existingType = storage.name.split(' ')[1]?.toLowerCase();
          return existingType !== storageType;
        });
        
        // Adicionar o novo storage
        updatedStorageItems.external = [...prev.external, option];
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
