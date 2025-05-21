
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
          // Para remoção, filtramos por ID base (removendo a parte de quantidade)
          const baseIdToRemove = option.id.replace(/-qty-\d+$/, '');
          updatedItems.internal = prev.internal.filter(disk => {
            const diskBaseId = disk.id.replace(/-qty-\d+$/, '');
            return diskBaseId !== baseIdToRemove;
          });
          
          console.log(`Removing disk with base ID ${baseIdToRemove}, new internal disks:`, updatedItems.internal);
          return updatedItems;
        }
        
        // Extrair a chave base sem a quantidade
        const baseId = option.id.replace(/-qty-\d+$/, '');
        
        // Verificar se já existe um disco com o mesmo ID base (mesmo tipo e capacidade)
        const existingDiskIndex = prev.internal.findIndex(disk => 
          disk.id.replace(/-qty-\d+$/, '') === baseId
        );
        
        if (existingDiskIndex >= 0) {
          // Se o disco já existe, vamos removê-lo e adicionar o novo com a quantidade atualizada
          const newInternalArray = prev.internal.filter((_, index) => index !== existingDiskIndex);
          
          console.log(
            `Updating disk ${option.id}, quantity: ${option.metadata?.quantity}, ` +
            `unit price: ${option.metadata?.unitPrice}, total price: ${option.price}`
          );
          
          // Adiciona o novo disco atualizado
          updatedItems.internal = [...newInternalArray, option];
        } else {
          // Adicionar novo disco
          console.log(
            `Adding new disk ${option.id}, quantity: ${option.metadata?.quantity}, ` +
            `unit price: ${option.metadata?.unitPrice}, total price: ${option.price}`
          );
          
          updatedItems.internal = [...prev.internal, option];
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

  const handleRemoveStorageItem = (itemId: string) => {
    // Check for internal disk IDs (they start with "internal-disk-")
    if (itemId.startsWith("internal-disk-")) {
      setStorageItems(prev => {
        // Encontrar todos os discos com o mesmo ID base (sem a parte de quantidade)
        const baseId = itemId.replace(/-qty-\d+$/, '');
        const filteredDisks = prev.internal.filter(disk => 
          !disk.id.replace(/-qty-\d+$/, '').includes(baseId)
        );
        
        return {
          ...prev,
          internal: filteredDisks
        };
      });
      toast.success("Disco removido com sucesso");
      return;
    }
    
    // Check for external storage IDs (they start with "external-storage-")
    if (itemId.startsWith("external-storage-")) {
      setStorageItems(prev => ({
        ...prev,
        external: prev.external.filter(storage => storage.id !== itemId)
      }));
      toast.success("Storage externo removido com sucesso");
      return;
    }
    
    // Handle the original storage removal cases
    if (itemId === "storage_internal") {
      setStorageItems(prev => ({
        ...prev,
        internal: []
      }));
      toast.success("Todos os discos internos foram removidos");
    } else if (itemId === "storage_external") {
      setStorageItems(prev => ({
        ...prev,
        external: []
      }));
      toast.success("Todos os storages externos foram removidos");
    }
  };

  return {
    storageItems,
    setStorageItems,
    handleSelectStorageItem,
    handleRemoveStorageItem
  };
}
