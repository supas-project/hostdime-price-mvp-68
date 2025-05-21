
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
        
        // Extrair tipo e capacidade do ID ou nome do disco
        let diskType = '';
        let capacity = '';
        
        if (option.id.includes('internal-disk-')) {
          const parts = option.id.replace('internal-disk-', '').split('-');
          diskType = parts[0];
          capacity = parts[1];
        } else if (option.name) {
          const nameParts = option.name.split(' ');
          if (nameParts.length >= 2) {
            diskType = nameParts[0].toLowerCase();
            capacity = nameParts[1];
          }
        }
        
        // Se encontramos tipo e capacidade válidos
        if (diskType && capacity) {
          // Remover qualquer disco com o mesmo tipo e capacidade (para evitar duplicações)
          updatedStorageItems.internal = prev.internal.filter(disk => {
            // Tentar extrair tipo e capacidade do disco existente
            let existingType = '';
            let existingCapacity = '';
            
            if (disk.id.includes('internal-disk-')) {
              const parts = disk.id.replace('internal-disk-', '').split('-');
              existingType = parts[0];
              existingCapacity = parts[1];
            } else if (disk.name) {
              const nameParts = disk.name.split(' ');
              if (nameParts.length >= 2) {
                existingType = nameParts[0].toLowerCase();
                existingCapacity = nameParts[1];
              }
            }
            
            // Manter apenas se for um tipo ou capacidade diferente
            return !(existingType === diskType && existingCapacity === capacity);
          });
        }
        
        // Adicionar o novo disco
        updatedStorageItems.internal = [...updatedStorageItems.internal, option];
      } else {
        // Para storage externo, substituímos o existente se for do mesmo tipo
        if (option.price === 0) {
          updatedStorageItems.external = prev.external.filter(storage => storage.id !== option.id);
          return updatedStorageItems;
        }
        
        // Extrair o tipo do nome do storage externo
        const storageType = option.name?.split(' ')[1]?.toLowerCase();
        
        // Remover storage existente do mesmo tipo
        if (storageType) {
          updatedStorageItems.external = prev.external.filter(storage => {
            const existingType = storage.name?.split(' ')[1]?.toLowerCase();
            return existingType !== storageType;
          });
        }
        
        // Adicionar o novo storage
        updatedStorageItems.external = [...updatedStorageItems.external, option];
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
