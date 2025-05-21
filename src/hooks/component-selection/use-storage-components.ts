
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
          updatedItems.internal = prev.internal.filter(disk => {
            // Extrair o ID base sem a quantidade para comparar corretamente
            const diskBaseId = disk.id.replace(/-qty-\d+$/, '');
            const optionBaseId = option.id.replace(/-qty-\d+$/, '');
            return diskBaseId !== optionBaseId;
          });
          console.log(`Removing disk with base ID ${option.id.replace(/-qty-\d+$/, '')}, new internal disks:`, updatedItems.internal);
          return updatedItems;
        }
        
        // Extrair a chave base sem a quantidade
        const baseId = option.id.replace(/-qty-\d+$/, '');
        
        // Verificar se já existe um disco com o mesmo ID base
        const existingDiskIndex = prev.internal.findIndex(disk => 
          disk.id.replace(/-qty-\d+$/, '') === baseId
        );
        
        if (existingDiskIndex >= 0) {
          // Se o disco já existe com o mesmo ID base, removemos o antigo
          const newInternalArray = prev.internal.filter((_, index) => index !== existingDiskIndex);
          // E adicionamos o novo disco atualizado
          updatedItems.internal = [...newInternalArray, option];
          console.log(`Updating disk with base ID ${baseId}, new option:`, option);
        } else {
          // Verificar se não há discos duplicados com o mesmo tipo e capacidade
          const duplicateIndex = prev.internal.findIndex(disk => {
            const diskBaseId = disk.id.replace(/internal-disk-(\w+)-(\d+\w+).*/, '$1-$2');
            const optionBaseId = option.id.replace(/internal-disk-(\w+)-(\d+\w+).*/, '$1-$2');
            return diskBaseId === optionBaseId;
          });

          if (duplicateIndex >= 0) {
            // Se encontramos um disco com mesmo tipo e capacidade, atualizamos em vez de adicionar
            const newInternalArray = prev.internal.filter((_, index) => index !== duplicateIndex);
            updatedItems.internal = [...newInternalArray, option];
            console.log(`Replacing duplicate disk with base type/capacity, new option:`, option);
          } else {
            // Adicionar novo disco se não houver duplicação
            updatedItems.internal = [...prev.internal, option];
            console.log(`Adding new disk ${option.id}, quantity: ${option.metadata?.quantity}`, option);
          }
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
