
import { useState, useEffect } from "react";
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

  // Recuperar dados salvos no carregamento
  useEffect(() => {
    try {
      const savedComponents = localStorage.getItem('selectedComponents');
      const savedStorageItems = localStorage.getItem('storageItems');
      const savedConnectivityItems = localStorage.getItem('connectivityItems');
      const savedCustomServices = localStorage.getItem('customServices');
      
      if (savedComponents) {
        setSelectedComponents(JSON.parse(savedComponents));
      }
      
      if (savedStorageItems) {
        setStorageItems(JSON.parse(savedStorageItems));
      }
      
      if (savedConnectivityItems) {
        setConnectivityItems(JSON.parse(savedConnectivityItems));
      }
      
      if (savedCustomServices) {
        setCustomServices(JSON.parse(savedCustomServices));
      }
    } catch (error) {
      console.error("Erro ao recuperar dados salvos:", error);
    }
  }, []);

  // Salvar alterações no localStorage
  useEffect(() => {
    const saveData = () => {
      try {
        localStorage.setItem('selectedComponents', JSON.stringify(selectedComponents));
        localStorage.setItem('storageItems', JSON.stringify(storageItems));
        localStorage.setItem('connectivityItems', JSON.stringify(connectivityItems));
        localStorage.setItem('customServices', JSON.stringify(customServices));
      } catch (error) {
        console.error("Erro ao salvar dados:", error);
      }
    };

    saveData();
  }, [selectedComponents, storageItems, connectivityItems, customServices]);

  const validateOption = (option: ComponentOption): boolean => {
    if (!option.type || !option.id || typeof option.price !== 'number') {
      console.error('Invalid option format:', option);
      toast.error('Erro na seleção do componente', {
        description: 'O formato do componente é inválido'
      });
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
      
      // Notificar usuário
      const componentType = option.type.toLowerCase() === "memoria" 
        ? "Memória" 
        : option.type === "SistemaOperacional" 
          ? "Sistema Operacional"
          : option.type;
      
      toast.success(`${componentType} selecionado`, {
        description: option.name
      });
      
      return updated;
    });
  };

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
          toast.success("Disco removido", {
            description: "O disco foi removido da configuração"
          });
        } else {
          const existingIndex = prev.internal.findIndex(item => item.id === option.id);
          const updatedItems = [...prev.internal];

          if (existingIndex >= 0) {
            updatedItems[existingIndex] = {
              ...option,
              price: (option.metadata?.unitPrice || option.price) * (option.metadata?.quantity || 1)
            };
            toast.success("Disco atualizado", {
              description: `Quantidade de ${option.name} atualizada`
            });
          } else {
            updatedItems.push({
              ...option,
              price: (option.metadata?.unitPrice || option.price) * (option.metadata?.quantity || 1)
            });
            toast.success("Disco adicionado", {
              description: option.name
            });
          }

          updatedStorageItems = {
            ...prev,
            internal: updatedItems
          };
        }
      } else {
        // Para storage externo, mantemos apenas um item
        const hasChanged = prev.external.length === 0 || 
                          prev.external[0]?.id !== option.id || 
                          option.price === 0;
                          
        if (hasChanged) {
          if (option.price === 0) {
            toast.success("Storage externo removido", {
              description: "O storage externo foi removido da configuração"
            });
          } else {
            toast.success("Storage externo adicionado", {
              description: option.name
            });
          }
        }
        
        updatedStorageItems = {
          ...prev,
          external: option.price === 0 ? [] : [option]
        };
      }

      return updatedStorageItems;
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
        const itemName = prev[type]?.option.name || "Item de conectividade";
        delete newItems[type];
        toast.success(`${itemName} removido`);
        return newItems;
      });
    } else if (type.includes("custom-service-")) {
      removeCustomService(type);
    } else {
      setSelectedComponents((prev) => {
        const updated = { ...prev };
        const componentName = prev[type]?.name || type;
        delete updated[type];
        toast.success(`${componentName} removido`);
        return updated;
      });
    }
  };

  const addCustomService = (service: ComponentOption) => {
    setCustomServices(prev => {
      const updated = [...prev, service];
      toast.success("Serviço adicional incluído", {
        description: service.name
      });
      return updated;
    });
  };

  const removeCustomService = (serviceId: string) => {
    setCustomServices(prev => {
      const serviceToRemove = prev.find(service => service.id === serviceId);
      const updated = prev.filter(service => service.id !== serviceId);
      
      if (serviceToRemove) {
        toast.success("Serviço adicional removido", {
          description: serviceToRemove.name
        });
      }
      
      return updated;
    });
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
