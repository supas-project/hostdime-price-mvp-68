import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { ServerComponent, ComponentOption } from "@/types/component";
import { serverData } from "@/data/server-components";
import { syncDiskDataWithPriceService } from "@/services/component-sync";
import { initExternalStorageData } from "@/services/component-sync";
import { syncConnectivityData } from "@/services/component-sync"; // Nova importação
import { ConnectivityItemsMap } from "@/types/wizard";

interface WizardContextProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedComponents: { [key: string]: ComponentOption };
  selectComponent: (
    componentType: string,
    option: ComponentOption,
    quantity: number
  ) => void;
  updateComponentQuantity: (
    componentType: string,
    optionId: string,
    quantity: number
  ) => void;
  removeComponent: (componentType: string, optionId: string) => void;
  isComponentSelected: (componentType: string, optionId: string) => boolean;
  getComponentQuantity: (componentType: string, optionId: string) => number;
  showFinalSummary: boolean;
  setShowFinalSummary: (show: boolean) => void;
  isStepComplete: (stepIndex: number) => boolean;
  setStepComplete: (stepIndex: number, complete: boolean) => void;
  completedSteps: boolean[];
  handleRestart: () => void;
  // Propriedades para corrigir erros
  storageItems: { 
    internal: ComponentOption[]; 
    external: ComponentOption[]; 
  };
  connectivityItems: ConnectivityItemsMap;
  customServices: ComponentOption[];
  handleSelectOption: (option: ComponentOption) => void;
  setConnectivityItems: (items: ConnectivityItemsMap) => void;
  handleSelectStorageItem: (option: ComponentOption, storageType: 'internal' | 'external') => void;
  handleRemoveComponent: (componentType: string, optionId?: string) => void;
  categoriesLoaded: boolean;
  beginnerMode: boolean;
  setBeginnerMode: (mode: boolean) => void;
  addCustomService?: (option: ComponentOption) => void;
  removeCustomService?: (optionId: string) => void;
}

interface WizardProviderProps {
  children: ReactNode;
}

const WizardContext = createContext<WizardContextProps | undefined>(undefined);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedComponents, setSelectedComponents] = useState<{
    [key: string]: ComponentOption;
  }>({});
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    new Array(serverData.componentes.length).fill(false)
  );
  const [beginnerMode, setBeginnerMode] = useState(true);
  
  // Correct state types 
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [storageItems, setStorageItems] = useState<{
    internal: ComponentOption[];
    external: ComponentOption[];
  }>({
    internal: [],
    external: []
  });
  const [connectivityItems, setConnectivityItems] = useState<ConnectivityItemsMap>({});
  const [customServices, setCustomServices] = useState<ComponentOption[]>([]);

  const selectComponent = (
    componentType: string,
    option: ComponentOption,
    quantity: number
  ) => {
    setSelectedComponents((prevComponents) => ({
      ...prevComponents,
      [componentType]: option,
    }));
  };

  const handleSelectOption = (option: ComponentOption) => {
    selectComponent(option.type, option, 1);
  };

  const handleSelectStorageItem = (option: ComponentOption, storageType: 'internal' | 'external') => {
    const key = storageType === 'internal' ? 'storage_internal' : 'storage_external';
    setStorageItems(prev => {
      const updatedItems = { ...prev };
      if (storageType === 'internal') {
        updatedItems.internal = [...updatedItems.internal, option];
      } else {
        updatedItems.external = [...updatedItems.external, option];
      }
      return updatedItems;
    });
    selectComponent(key, option, 1);
  };

  const updateComponentQuantity = (
    componentType: string,
    optionId: string,
    quantity: number
  ) => {
    // Implementação existente
  };

  const removeComponent = (componentType: string, optionId: string) => {
    setSelectedComponents((prevComponents) => {
      const newComponents = { ...prevComponents };
      if (
        newComponents[componentType] &&
        newComponents[componentType].id === optionId
      ) {
        delete newComponents[componentType];
      }
      return newComponents;
    });
  };
  
  // Update handler for removeComponent to make it compatible
  const handleRemoveComponent = (componentType: string, optionId?: string) => {
    if (optionId) {
      removeComponent(componentType, optionId);
    } else {
      removeComponent(componentType, componentType);
    }
  };

  const isComponentSelected = (componentType: string, optionId: string) => {
    const component = selectedComponents[componentType];
    return component ? component.id === optionId : false;
  };

  const getComponentQuantity = (componentType: string, optionId: string) => {
    const component = selectedComponents[componentType];
    return component ? 1 : 0;
  };

  const isStepComplete = useCallback((stepIndex: number) => {
    return completedSteps[stepIndex] || false;
  }, [completedSteps]);

  const setStepComplete = (stepIndex: number, complete: boolean) => {
    setCompletedSteps((prev) => {
      const newCompletedSteps = [...prev];
      newCompletedSteps[stepIndex] = complete;
      return newCompletedSteps;
    });
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedComponents({});
    setShowFinalSummary(false);
    setCompletedSteps(new Array(serverData.componentes.length).fill(false));
    setStorageItems({ internal: [], external: [] });
    setConnectivityItems({});
    setCustomServices([]);
  };

  const addCustomService = (option: ComponentOption) => {
    setCustomServices(prev => [...prev, option]);
  };

  const removeCustomService = (optionId: string) => {
    setCustomServices(prev => prev.filter(service => service.id !== optionId));
  };

  useEffect(() => {
    // Initialize data from PriceService
    syncDiskDataWithPriceService();

    // Initialize external storage data
    initExternalStorageData();
    
    // Sincronizar dados de conectividade
    syncConnectivityData().then(() => {
      setCategoriesLoaded(true);
    });
  
  }, []); // dependencies array

  const value: WizardContextProps = {
    currentStep,
    setCurrentStep,
    selectedComponents,
    selectComponent,
    updateComponentQuantity,
    removeComponent,
    isComponentSelected,
    getComponentQuantity,
    showFinalSummary,
    setShowFinalSummary,
    isStepComplete,
    setStepComplete,
    completedSteps,
    handleRestart,
    // Fixes for typed properties
    storageItems,
    connectivityItems,
    customServices,
    handleSelectOption,
    setConnectivityItems,
    handleSelectStorageItem,
    handleRemoveComponent,
    categoriesLoaded,
    beginnerMode,
    setBeginnerMode,
    addCustomService,
    removeCustomService
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};
