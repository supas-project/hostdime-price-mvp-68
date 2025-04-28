
import { useState } from "react";
import { ComponentOption, StorageItems } from "@/types/component";
import { toast } from "sonner";

export function useComponentSelection() {
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: ComponentOption }>({});
  const [connectivityItems, setConnectivityItems] = useState<{ [key: string]: { option: ComponentOption, quantity: number } }>({});
  const [storageItems, setStorageItems] = useState<StorageItems>({
    internal: [],
    external: []
  });
  const [customServices, setCustomServices] = useState<ComponentOption[]>([]);

  const validateOption = (option: ComponentOption): boolean => {
    if (!option.type || !option.id || typeof option.price !== 'number') {
      console.error('Invalid option format:', option);
      toast.error('Erro na seleção do componente');
      return false;
    }
    return true;
  };

  const handleSelectOption = (option: ComponentOption) => {
    console.log("Selecting option:", option);
    
    if (!validateOption(option)) return;

    setSelectedComponents((prev) => {
      const updated = { ...prev };
      
      if (option.type.toLowerCase() === "memoria") {
        console.log("Setting memory component:", option);
        updated["memoria"] = option;
      } else if (option.type === "SistemaOperacional") {
        updated["sistemaoperacional"] = option;
      } else {
        updated[option.type.toLowerCase()] = option;
      }
      
      console.log("Updated components:", updated);
      return updated;
    });
  };

  const handleSelectStorageItem = (option: ComponentOption, storageType: 'internal' | 'external') => {
    console.log("Selecting storage item:", option, storageType);
    
    if (storageType === 'internal') {
      setStorageItems(prev => {
        const existingItems = [...prev.internal];
        const existingIndex = existingItems.findIndex(item => item.id === option.id);
        
        if (existingIndex >= 0) {
          const existingItem = existingItems[existingIndex];
          const updatedItem = {
            ...option,
            price: (option.metadata?.unitPrice || option.price) * (option.metadata?.quantity || 1),
            metadata: {
              ...option.metadata,
              raid: existingItem.metadata?.raid
            }
          };
          existingItems[existingIndex] = updatedItem;
        } else {
          existingItems.push({
            ...option,
            price: (option.metadata?.unitPrice || option.price) * (option.metadata?.quantity || 1)
          });
        }
        
        return {
          ...prev,
          internal: existingItems
        };
      });
    } else {
      setStorageItems(prev => ({
        ...prev,
        external: [option]
      }));
    }
  };

  const handleRemoveComponent = (type: string) => {
    console.log("Removing component:", type);
    
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
    } else if (type.includes("network-") || type.includes("ip-")) {
      setConnectivityItems(prev => {
        const newItems = { ...prev };
        delete newItems[type];
        return newItems;
      });
      
      toast.success("Componente removido com sucesso");
    } else if (type.includes("custom-service-")) {
      removeCustomService(type);
    } else {
      setSelectedComponents((prev) => {
        const updated = { ...prev };
        delete updated[type];
        
        toast.success("Componente removido com sucesso");
        
        return updated;
      });
    }
  };

  const addCustomService = (service: ComponentOption) => {
    setCustomServices(prev => [...prev, service]);
  };

  const removeCustomService = (serviceId: string) => {
    setCustomServices(prev => prev.filter(service => service.id !== serviceId));
  };

  return {
    selectedComponents,
    setSelectedComponents,
    connectivityItems,
    setConnectivityItems,
    storageItems,
    customServices,
    handleSelectOption,
    handleSelectStorageItem,
    handleRemoveComponent,
    addCustomService,
    removeCustomService
  };
}
