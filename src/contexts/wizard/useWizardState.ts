
import { useState, useCallback } from "react";
import { ComponentOption } from "@/types/component";
import { StorageItems } from "./types";

export function useWizardState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: ComponentOption }>({});
  const [selectedContractOption, setSelectedContractOption] = useState<ComponentOption | null>(null);
  const [storageItems, setStorageItems] = useState<StorageItems>({
    internal: [],
    external: []
  });
  const [connectivityItems, setConnectivityItems] = useState<{ [key: string]: { option: ComponentOption; quantity: number } }>({});
  const [customServices, setCustomServices] = useState<ComponentOption[]>([]);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [stepCompletionStatus, setStepCompletionStatus] = useState<{ [key: number]: boolean }>({});

  const totalSteps = 8; // Adjust based on your wizard steps

  const handleSelectOption = useCallback((option: ComponentOption) => {
    console.log(`[WizardState] Selecting option: ${option.name} of type: ${option.type}`);
    
    const componentType = option.type.toLowerCase();
    
    // Special handling for contract options
    if (componentType === "contrato" || componentType === "contract") {
      console.log(`[WizardState] Setting contract option:`, option);
      setSelectedContractOption(option);
      setSelectedComponents(prev => ({
        ...prev,
        ["contrato"]: option
      }));
      return;
    }
    
    setSelectedComponents(prev => ({
      ...prev,
      [componentType]: option
    }));
  }, []);

  const handleSelectStorageItem = useCallback((storageOption: ComponentOption, storageType: 'internal' | 'external') => {
    console.log(`[WizardState] Adding ${storageType} storage:`, storageOption);
    
    setStorageItems(prev => ({
      ...prev,
      [storageType]: [...prev[storageType], storageOption]
    }));
  }, []);

  const handleRemoveComponent = useCallback((id: string, type?: string) => {
    console.log(`[WizardState] Removing component: ${id}, type: ${type}`);
    
    // Handle storage removal
    if (id.includes('internal-storage') || id.includes('external-storage')) {
      const storageType = id.includes('internal') ? 'internal' : 'external';
      const index = parseInt(id.split('-').pop() || '0');
      
      setStorageItems(prev => ({
        ...prev,
        [storageType]: prev[storageType].filter((_, i) => i !== index)
      }));
      return;
    }
    
    // Handle connectivity removal
    if (id.includes('network-') || id.includes('ip-')) {
      setConnectivityItems(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      return;
    }
    
    // Handle custom services removal
    if (customServices.find(service => service.id === id)) {
      removeCustomService(id);
      return;
    }
    
    // Handle contract removal
    if (type === "contrato" || type === "contract") {
      setSelectedContractOption(null);
      setSelectedComponents(prev => {
        const updated = { ...prev };
        delete updated["contrato"];
        return updated;
      });
      return;
    }
    
    // Handle standard component removal
    setSelectedComponents(prev => {
      const updated = { ...prev };
      if (type) {
        delete updated[type.toLowerCase()];
      } else {
        // Try to find by ID if type not provided
        Object.keys(updated).forEach(key => {
          if (updated[key]?.id === id) {
            delete updated[key];
          }
        });
      }
      return updated;
    });
  }, [customServices]);

  const addCustomService = useCallback((service: ComponentOption) => {
    setCustomServices(prev => [...prev, service]);
  }, []);

  const removeCustomService = useCallback((id: string) => {
    setCustomServices(prev => prev.filter(service => service.id !== id));
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setSelectedComponents({});
    setSelectedContractOption(null);
    setStorageItems({ internal: [], external: [] });
    setConnectivityItems({});
    setCustomServices([]);
    setShowFinalSummary(false);
    setStepCompletionStatus({});
  }, []);

  const isStepComplete = useCallback((stepIndex: number) => {
    // Check manual override first
    if (stepCompletionStatus[stepIndex] !== undefined) {
      return stepCompletionStatus[stepIndex];
    }
    
    // Implement step completion logic based on your requirements
    switch (stepIndex) {
      case 0: // DataCenter
        return !!selectedComponents["datacenter"];
      case 1: // Contract
        return !!selectedContractOption;
      case 2: // Processor
        return !!selectedComponents["processador"];
      case 3: // Memory
        return !!selectedComponents["memoria"];
      case 4: // OS
        return !!selectedComponents["sistemaoperacional"];
      case 5: // Storage
        return storageItems.internal.length > 0 || storageItems.external.length > 0;
      case 6: // Connectivity
        return Object.keys(connectivityItems).length > 0;
      default:
        return false;
    }
  }, [selectedComponents, selectedContractOption, storageItems, connectivityItems, stepCompletionStatus]);

  const setStepComplete = useCallback((stepIndex: number, complete: boolean) => {
    setStepCompletionStatus(prev => ({
      ...prev,
      [stepIndex]: complete
    }));
  }, []);

  return {
    currentStep,
    setCurrentStep,
    totalSteps,
    selectedComponents,
    setSelectedComponents,
    selectedContractOption,
    setSelectedContractOption,
    storageItems,
    setStorageItems,
    connectivityItems,
    setConnectivityItems,
    customServices,
    showFinalSummary,
    setShowFinalSummary,
    beginnerMode,
    setBeginnerMode,
    categoriesLoaded,
    handleSelectOption,
    handleSelectStorageItem,
    handleRemoveComponent,
    addCustomService,
    removeCustomService,
    handleRestart,
    isStepComplete,
    setStepComplete
  };
}
