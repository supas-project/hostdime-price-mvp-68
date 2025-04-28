import { createContext, useContext, useState, ReactNode } from "react";
import { ComponentOption, StorageItems } from "@/types/component";
import { serverData } from "@/data/server-components";
import { toast } from "sonner";

interface WizardContextType {
  currentStep: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
  selectedComponents: { [key: string]: ComponentOption };
  setSelectedComponents: (components: { [key: string]: ComponentOption }) => void;
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } };
  setConnectivityItems: (items: { [key: string]: { option: ComponentOption, quantity: number } }) => void;
  showFinalSummary: boolean;
  setShowFinalSummary: (show: boolean) => void;
  handleSelectOption: (option: ComponentOption) => void;
  handleRestart: () => void;
  isStepComplete: (stepIndex: number) => boolean;
  handleSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
  handleRemoveComponent: (type: string) => void;
  storageItems: StorageItems;
  customServices: ComponentOption[];
  addCustomService: (service: ComponentOption) => void;
  removeCustomService: (serviceId: string) => void;
}

export const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: ComponentOption }>({});
  const [connectivityItems, setConnectivityItems] = useState<{ [key: string]: { option: ComponentOption, quantity: number } }>({});
  const [showFinalSummary, setShowFinalSummary] = useState(false);
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
          // Update existing item while preserving RAID config
          const existingItem = existingItems[existingIndex];
          const updatedItem = {
            ...option,
            price: (option.metadata?.unitPrice || option.price) * (option.metadata?.quantity || 1),
            metadata: {
              ...option.metadata,
              raid: existingItem.metadata?.raid // Preserve RAID configuration
            }
          };
          existingItems[existingIndex] = updatedItem;
        } else {
          // Add new item
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
      // For external storage, we replace any existing storage
      setStorageItems(prev => ({
        ...prev,
        external: [option]
      }));
    }
  };

  const addCustomService = (service: ComponentOption) => {
    setCustomServices(prev => [...prev, service]);
  };

  const removeCustomService = (serviceId: string) => {
    setCustomServices(prev => prev.filter(service => service.id !== serviceId));
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
      // Handle connectivity item removal
      setConnectivityItems(prev => {
        const newItems = { ...prev };
        delete newItems[type];
        return newItems;
      });
      
      toast.success("Componente removido com sucesso");
    } else if (type.includes("custom-service-")) {
      // Handle custom service removal
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

  const handleRestart = () => {
    setSelectedComponents({});
    setConnectivityItems({});
    setStorageItems({
      internal: [],
      external: []
    });
    setCustomServices([]);
    setCurrentStep(0);
    setShowFinalSummary(false);
  };

  const isStepComplete = (stepIndex: number) => {
    const component = serverData.componentes[stepIndex];
    if (!component) return false;

    const type = component.type;
    console.log(`Checking completion for type: ${type}`);

    let hasComponent = false;
    
    if (type === "Memória") {
      hasComponent = selectedComponents["memoria"] !== undefined;
    } else if (type === "Contrato") {
      hasComponent = selectedComponents["contrato"] !== undefined;
    } else if (type === "Conectividade") {
      const hasPort = Object.values(connectivityItems).some(
        item => item.option.subtype === "porta"
      );
      const hasIp = Object.values(connectivityItems).some(
        item => item.option.subtype === "ip"
      );
      hasComponent = hasPort && hasIp;
    } else if (type === "Armazenamento") {
      const hasInternalStorage = storageItems.internal.length > 0;
      const hasExternalStorage = storageItems.external.length > 0;
      hasComponent = hasInternalStorage || hasExternalStorage;
    } else if (type === "SistemaOperacional") {
      hasComponent = selectedComponents["sistemaoperacional"] !== undefined;
    } else if (type === "ServiçosPersonalizados") {
      // Custom services are optional
      hasComponent = true;
    } else {
      const typeKey = type.toLowerCase();
      hasComponent = selectedComponents[typeKey] !== undefined;
    }

    return hasComponent;
  };

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        selectedComponents,
        setSelectedComponents,
        connectivityItems,
        setConnectivityItems,
        showFinalSummary,
        setShowFinalSummary,
        handleSelectOption,
        handleRestart,
        isStepComplete,
        handleSelectStorageItem,
        handleRemoveComponent,
        storageItems,
        customServices,
        addCustomService,
        removeCustomService
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};
