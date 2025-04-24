import { createContext, useContext, useState, ReactNode } from "react";
import { ComponentOption, serverData } from "@/data/server-components";

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
}

export const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: ComponentOption }>({});
  const [connectivityItems, setConnectivityItems] = useState<{ [key: string]: { option: ComponentOption, quantity: number } }>({});
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  const handleSelectOption = (option: ComponentOption) => {
    setSelectedComponents((prev) => {
      const updated = { ...prev };
      if (option.type === "Processador" && prev["cpu"] && prev["cpu"].id !== option.id) {
        delete updated["cpu"];
      }
      updated[option.type.toLowerCase()] = option;
      return updated;
    });
  };

  const handleSelectStorageItem = (option: ComponentOption, storageType: 'internal' | 'external') => {
    setSelectedComponents((prev) => {
      const updated = { ...prev };
      const storageKey = `storage_${storageType}`;
      
      if (option.price === 0) {
        delete updated[storageKey];
      } else {
        updated[storageKey] = {
          ...option,
          type: `${storageType === 'internal' ? 'Disco Interno' : 'Storage Externo'}`
        };
      }
      
      return updated;
    });
  };

  const handleRestart = () => {
    setSelectedComponents({});
    setConnectivityItems({});
    setCurrentStep(0);
    setShowFinalSummary(false);
  };

  const isStepComplete = (stepIndex: number) => {
    const component = serverData.componentes[stepIndex];
    
    if (component.type === "Conectividade") {
      return Object.keys(connectivityItems).length > 0 || selectedComponents[component.id] !== undefined;
    } else if (component.type === "Armazenamento") {
      return selectedComponents["storage_internal"] !== undefined || 
             selectedComponents["storage_external"] !== undefined;
    }
    
    return selectedComponents[component.id] !== undefined;
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
