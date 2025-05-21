
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
      // Clone do estado atual para evitar mutações diretas
      const updatedItems = { ...prev };
      
      if (storageType === 'internal') {
        // Se o preço for 0, significa que estamos removendo o disco
        if (option.price === 0) {
          updatedItems.internal = prev.internal.filter(disk => disk.id !== option.id);
        } else {
          // Verificar se já existe um disco com o mesmo ID
          const existingDiskIndex = prev.internal.findIndex(disk => disk.id === option.id);
          
          if (existingDiskIndex >= 0) {
            // Se o disco já existe, substituir com o novo (atualizado)
            updatedItems.internal = [
              ...prev.internal.slice(0, existingDiskIndex),
              option,
              ...prev.internal.slice(existingDiskIndex + 1)
            ];
          } else {
            // Adicionar novo disco apenas se não existir
            updatedItems.internal = [...prev.internal, option];
          }
        }
      } else {
        // Para storage externo, substituímos o item existente se houver um
        if (option.price === 0) {
          updatedItems.external = prev.external.filter(storage => storage.id !== option.id);
        } else {
          // Verificar se já temos um storage externo com o mesmo ID
          const existingIndex = prev.external.findIndex(storage => storage.id === option.id);
          
          if (existingIndex >= 0) {
            // Substituir o storage existente
            updatedItems.external = [
              ...prev.external.slice(0, existingIndex),
              option,
              ...prev.external.slice(existingIndex + 1)
            ];
          } else {
            // Adicionar novo storage
            updatedItems.external = [...prev.external, option];
          }
        }
      }
      
      return updatedItems;
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
