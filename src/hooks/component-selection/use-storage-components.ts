
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
        // Se o preço for 0 ou quantidade 0, removemos o disco
        if (option.price === 0 || (option.metadata?.quantity || 0) <= 0) {
          updatedItems.internal = prev.internal.filter(disk => disk.id !== option.id);
          console.log(`Removing disk ${option.id}, new internal disks:`, updatedItems.internal);
          return updatedItems;
        }
        
        // Verificar se já existe um disco com o mesmo ID
        const existingDiskIndex = prev.internal.findIndex(disk => disk.id === option.id);
        
        if (existingDiskIndex >= 0) {
          // Se o disco já existe, atualizamos com o novo
          const newInternalArray = [...prev.internal];
          newInternalArray[existingDiskIndex] = option;
          updatedItems.internal = newInternalArray;
          console.log(`Updating disk ${option.id} at index ${existingDiskIndex}, quantity: ${option.metadata?.quantity}`, option);
        } else {
          // Adicionar novo disco
          updatedItems.internal = [...prev.internal, option];
          console.log(`Adding new disk ${option.id}, quantity: ${option.metadata?.quantity}`, option);
        }
      } else if (storageType === 'external') {
        // Para storage externo
        if (option.price === 0 || (option.metadata?.quantity || 0) <= 0) {
          updatedItems.external = prev.external.filter(storage => storage.id !== option.id);
          return updatedItems;
        }
        
        // Verificar se já existe um storage com o mesmo ID
        const existingIndex = prev.external.findIndex(storage => storage.id === option.id);
        
        if (existingIndex >= 0) {
          // Se já existe, atualiza
          const newExternalArray = [...prev.external];
          newExternalArray[existingIndex] = option;
          updatedItems.external = newExternalArray;
        } else {
          // Adiciona novo
          updatedItems.external = [...prev.external, option];
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
