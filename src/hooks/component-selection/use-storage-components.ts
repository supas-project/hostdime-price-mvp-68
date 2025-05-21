
import { useState, useCallback } from "react";
import { ComponentOption, StorageItems } from "@/types/component";
import { toast } from "sonner";
import { createDiskUniqueKey } from "@/utils/html/price-calculator";

export function useStorageComponents() {
  const [storageItems, setStorageItems] = useState<StorageItems>({
    internal: [],
    external: []
  });

  /**
   * Função centralizada para adicionar ou atualizar um item de armazenamento
   * Usa uma chave única baseada em tipo+capacidade para evitar duplicações
   */
  const handleSelectStorageItem = useCallback((option: ComponentOption, storageType: 'internal' | 'external') => {
    if (!option || !option.id) {
      console.error("Invalid storage option:", option);
      return;
    }

    setStorageItems(prev => {
      // Cria uma cópia profunda do estado anterior
      const updatedStorageItems = { ...prev };
      
      // Se o preço for 0, significa que estamos removendo o disco
      if (option.price === 0) {
        const storageArray = storageType === 'internal' ? [...prev.internal] : [...prev.external];
        const filteredArray = storageArray.filter(disk => disk.id !== option.id);
        updatedStorageItems[storageType] = filteredArray;
        return updatedStorageItems;
      }
      
      // Cria uma chave única para o novo item baseada em tipo+capacidade
      const newItemKey = createDiskUniqueKey(option);
      
      // Obtém o array correto baseado no tipo de armazenamento
      const storageArray = storageType === 'internal' ? [...prev.internal] : [...prev.external];
      
      // Remove qualquer item existente com a mesma chave única (mesmo tipo e capacidade)
      const filteredArray = storageArray.filter(disk => {
        // Só mantém discos que têm uma chave única diferente do novo disco
        const existingKey = createDiskUniqueKey(disk);
        return existingKey !== newItemKey;
      });
      
      // Adiciona o novo item ao array filtrado
      filteredArray.push(option);
      
      // Atualiza o estado com o array filtrado + novo item
      updatedStorageItems[storageType] = filteredArray;
      
      return updatedStorageItems;
    });
  }, []);

  /**
   * Função para remover um item de armazenamento específico
   * Suporta tanto remoção por ID específico quanto por categoria completa
   */
  const handleRemoveStorageItem = useCallback((type: string) => {
    // Case 1: Remover um disco interno específico
    if (type.startsWith("internal-disk-")) {
      setStorageItems(prev => ({
        ...prev,
        internal: prev.internal.filter(disk => disk.id !== type)
      }));
      return;
    }
    
    // Case 2: Remover um armazenamento externo específico
    if (type.startsWith("external-storage-")) {
      setStorageItems(prev => ({
        ...prev,
        external: prev.external.filter(storage => storage.id !== type)
      }));
      return;
    }
    
    // Case 3: Remover todos os discos internos
    if (type === "storage_internal") {
      setStorageItems(prev => ({
        ...prev,
        internal: []
      }));
    } 
    // Case 4: Remover todo o armazenamento externo
    else if (type === "storage_external") {
      setStorageItems(prev => ({
        ...prev,
        external: []
      }));
    }
  }, []);

  /**
   * Função para obter discos únicos, sem duplicatas
   * Utiliza a função de deduplicação do price-calculator
   */
  const getUniqueStorageItems = useCallback(() => {
    // Importação dinâmica para evitar dependência cíclica
    const { deduplicateStorageItems } = require("@/utils/html/price-calculator");
    
    return {
      internal: deduplicateStorageItems(storageItems.internal),
      external: deduplicateStorageItems(storageItems.external)
    };
  }, [storageItems]);

  /**
   * Função auxiliar para verificar se um disco já existe
   * baseado em tipo e capacidade
   */
  const isDiskDuplicate = useCallback((newDisk: ComponentOption, storageType: 'internal' | 'external'): boolean => {
    const storageArray = storageType === 'internal' ? storageItems.internal : storageItems.external;
    const newDiskKey = createDiskUniqueKey(newDisk);
    
    return storageArray.some(existingDisk => {
      const existingKey = createDiskUniqueKey(existingDisk);
      return existingKey === newDiskKey;
    });
  }, [storageItems]);

  return {
    // Estados principais
    storageItems,
    setStorageItems,
    
    // Handlers principais
    handleSelectStorageItem,
    handleRemoveStorageItem,
    
    // Funções auxiliares
    getUniqueStorageItems,
    isDiskDuplicate
  };
}
