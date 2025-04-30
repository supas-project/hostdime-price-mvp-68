
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
          // Criar uma chave única baseada nas propriedades reais do disco para evitar duplicações
          const diskType = option.subtype || option.name.split(' ')[0];
          const capacityMatch = option.name.match(/(\d+(?:\.\d+)?[GT]B)/i);
          const capacity = capacityMatch ? capacityMatch[0] : '';
          const uniqueKey = `${diskType}-${capacity}`;
          
          // Verificar se já existe um disco com essas características
          const existingIndex = prev.internal.findIndex(disk => {
            const diskTypeMatch = disk.subtype || disk.name.split(' ')[0];
            const diskCapacityMatch = disk.name.match(/(\d+(?:\.\d+)?[GT]B)/i);
            const diskCapacity = diskCapacityMatch ? diskCapacityMatch[0] : '';
            return `${diskTypeMatch}-${diskCapacity}` === uniqueKey && disk.id === option.id;
          });

          const updatedItems = [...prev.internal];

          if (existingIndex >= 0) {
            // Atualizar disco existente
            updatedItems[existingIndex] = {
              ...option,
              price: (option.metadata?.unitPrice || option.price) * (option.metadata?.quantity || 1)
            };
          } else {
            // Adicionar novo disco
            // Primeiro, remover qualquer disco com o mesmo ID para evitar duplicação
            const filteredItems = updatedItems.filter(disk => disk.id !== option.id);
            filteredItems.push({
              ...option,
              price: (option.metadata?.unitPrice || option.price) * (option.metadata?.quantity || 1)
            });
            
            updatedStorageItems = {
              ...prev,
              internal: filteredItems
            };
            
            return updatedStorageItems;
          }

          updatedStorageItems = {
            ...prev,
            internal: updatedItems
          };
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
