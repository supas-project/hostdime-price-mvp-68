
import { createContext, useContext, useState, ReactNode } from "react";
import { ComponentOption } from "@/types/component";
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
}

export const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: ComponentOption }>({});
  const [connectivityItems, setConnectivityItems] = useState<{ [key: string]: { option: ComponentOption, quantity: number } }>({});
  const [showFinalSummary, setShowFinalSummary] = useState(false);

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
      } else {
        updated[option.type.toLowerCase()] = option;
      }
      
      console.log("Updated components:", updated);
      return updated;
    });
  };

  const handleSelectStorageItem = (option: ComponentOption, storageType: 'internal' | 'external') => {
    console.log("Selecting storage item:", option, storageType);
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

  const handleRemoveComponent = (type: string) => {
    console.log("Removing component:", type);
    setSelectedComponents((prev) => {
      const updated = { ...prev };
      delete updated[type];
      
      // Fix: Use toast function correctly for sonner
      toast("Componente removido", {
        description: "O componente foi removido com sucesso"
      });
      
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
    if (!component) return false;

    const type = component.type;
    console.log(`Checking completion for type: ${type}`);

    let hasComponent = false;
    
    if (type === "Memória") {
      hasComponent = selectedComponents["memoria"] !== undefined;
      console.log("Memory completion check:", {
        hasComponent,
        memoryComponent: selectedComponents["memoria"]
      });
    } else if (type === "Contrato") {
      hasComponent = selectedComponents["contrato"] !== undefined;
    } else if (type === "Conectividade") {
      hasComponent = Object.keys(connectivityItems).length > 0;
    } else if (type === "Armazenamento") {
      hasComponent = selectedComponents["storage_internal"] !== undefined || 
                    selectedComponents["storage_external"] !== undefined;
    } else {
      hasComponent = selectedComponents[type.toLowerCase()] !== undefined;
    }

    console.log(`Step completion for ${type}:`, {
      step: stepIndex,
      type,
      hasComponent,
      selectedComponents
    });

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
