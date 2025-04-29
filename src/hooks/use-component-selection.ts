
import { useState } from "react";
import { ComponentOption, StorageItems } from "@/types/component";
import { toast } from "sonner";
import { PricedDiskOption } from "@/types/storage";

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
    if (!option || !option.id) {
      console.error("Invalid storage option:", option);
      return;
    }

    setStorageItems(prev => {
      if (storageType === 'internal') {
        // Se o preço for 0, significa que estamos removendo o disco
        if (option.price === 0) {
          return {
            ...prev,
            internal: prev.internal.filter(disk => disk.id !== option.id)
          };
        }

        const existingIndex = prev.internal.findIndex(item => item.id === option.id);
        const updatedItems = [...prev.internal];

        if (existingIndex >= 0) {
          updatedItems[existingIndex] = {
            ...option,
            price: (option.metadata?.unitPrice || option.price) * (option.metadata?.quantity || 1)
          };
        } else {
          updatedItems.push({
            ...option,
            price: (option.metadata?.unitPrice || option.price) * (option.metadata?.quantity || 1)
          });
        }

        return {
          ...prev,
          internal: updatedItems
        };
      } else {
        // Para storage externo, mantemos apenas um item
        return {
          ...prev,
          external: option.price === 0 ? [] : [option]
        };
      }
    });
  };

  const handleRemoveComponent = (type: string) => {
    console.log("Removing component:", type);
    
    // Check for internal disk IDs (they start with "internal-disk-")
    if (type.startsWith("internal-disk-")) {
      setStorageItems(prev => ({
        ...prev,
        internal: prev.internal.filter(disk => disk.id !== type)
      }));
      toast.success("Disco interno removido");
      return;
    }
    
    // Check for external storage IDs (they start with "external-storage-")
    if (type.startsWith("external-storage-")) {
      setStorageItems(prev => ({
        ...prev,
        external: prev.external.filter(storage => storage.id !== type)
      }));
      toast.success("Storage externo removido");
      return;
    }
    
    // Handle the original storage removal cases
    if (type === "storage_internal") {
      setStorageItems(prev => ({
        ...prev,
        internal: []
      }));
      toast.success("Armazenamento interno removido");
    } else if (type === "storage_external") {
      setStorageItems(prev => ({
        ...prev,
        external: []
      }));
      toast.success("Storage externo removido");
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
