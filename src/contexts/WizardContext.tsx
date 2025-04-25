
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
      
      switch (option.type) {
        case "Contrato":
          updated["contrato"] = option;
          break;
        case "Processador":
          updated["processador"] = option;
          break;
        case "Memória":
          if (option.name && !isNaN(parseFloat(option.name))) {
            updated["memoria"] = {
              ...option,
              name: `${option.name}`,
              price: parseFloat(option.name) * 7.5
            };
          } else {
            toast.error('Valor de memória inválido');
            return prev;
          }
          break;
        default:
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

  const handleRestart = () => {
    setSelectedComponents({});
    setConnectivityItems({});
    setCurrentStep(0);
    setShowFinalSummary(false);
  };

  const isStepComplete = (stepIndex: number) => {
    const component = serverData.componentes[stepIndex];
    const componentType = component.type.toLowerCase();
    
    if (component.type === "Contrato") {
      return selectedComponents["contrato"] !== undefined;
    } else if (component.type === "Conectividade") {
      return Object.keys(connectivityItems).length > 0;
    } else if (component.type === "Armazenamento") {
      return selectedComponents["storage_internal"] !== undefined || 
             selectedComponents["storage_external"] !== undefined;
    }
    
    return selectedComponents[componentType] !== undefined;
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
