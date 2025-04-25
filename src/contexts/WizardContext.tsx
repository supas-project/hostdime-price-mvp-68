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
          console.log("Setting contract:", option);
          updated["contrato"] = option;
          break;
        case "Processador":
          updated["processador"] = option;
          break;
        case "Memória":
          console.log("Setting memory:", option);
          if (option.name && !isNaN(parseFloat(option.name))) {
            const memorySize = parseFloat(option.name);
            const memoryOption = {
              id: `ram-${memorySize}`,
              name: `${memorySize}GB RAM`,
              price: memorySize * 7.5,
              type: "Memória"
            };
            updated["memoria"] = memoryOption;
            console.log("Updated memory component:", updated["memoria"]);
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
    if (!component) return false;

    const type = component.type;
    const hasComponent = type === "Contrato" 
      ? selectedComponents["contrato"] !== undefined
      : type === "Memória"
      ? selectedComponents["memoria"] !== undefined
      : type === "Conectividade"
      ? Object.keys(connectivityItems).length > 0
      : type === "Armazenamento"
      ? (selectedComponents["storage_internal"] !== undefined || selectedComponents["storage_external"] !== undefined)
      : selectedComponents[type.toLowerCase()] !== undefined;

    console.log(`Checking step completion for ${type}:`, {
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
