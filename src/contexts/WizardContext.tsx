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

interface WizardContextProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedComponents: { [key: string]: { option: ComponentOption; quantity: number } };
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
    [key: string]: { option: ComponentOption; quantity: number };
  }>({});
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    new Array(serverData.componentes.length).fill(false)
  );

  const selectComponent = (
    componentType: string,
    option: ComponentOption,
    quantity: number
  ) => {
    setSelectedComponents((prevComponents) => ({
      ...prevComponents,
      [componentType]: { option, quantity },
    }));
  };

  const updateComponentQuantity = (
    componentType: string,
    optionId: string,
    quantity: number
  ) => {
    setSelectedComponents((prevComponents) => {
      const component = prevComponents[componentType];
      if (component && component.option.id === optionId) {
        return {
          ...prevComponents,
          [componentType]: { ...component, quantity },
        };
      }
      return prevComponents;
    });
  };

  const removeComponent = (componentType: string, optionId: string) => {
    setSelectedComponents((prevComponents) => {
      const newComponents = { ...prevComponents };
      if (
        newComponents[componentType] &&
        newComponents[componentType].option.id === optionId
      ) {
        delete newComponents[componentType];
      }
      return newComponents;
    });
  };

  const isComponentSelected = (componentType: string, optionId: string) => {
    const component = selectedComponents[componentType];
    return component ? component.option.id === optionId : false;
  };

  const getComponentQuantity = (componentType: string, optionId: string) => {
    const component = selectedComponents[componentType];
    return component ? component.quantity : 0;
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
  };

  useEffect(() => {
    // Initialize data from PriceService
    syncDiskDataWithPriceService();

    // Initialize external storage data
    initExternalStorageData();
    
  // Sincronizar dados de conectividade
  syncConnectivityData();
  
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
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};
