
import { createContext, useContext, ReactNode } from "react";
import { WizardContextType } from "@/types/wizard";
import { useComponentSelection } from "@/hooks/use-component-selection";
import { useWizardSteps } from "@/hooks/use-wizard-steps";
import { ComponentOption } from "@/types/component";
import { serverData } from "@/data/server-components";

export const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const {
    selectedComponents,
    setSelectedComponents,
    connectivityItems,
    setConnectivityItems,
    storageItems,
    setStorageItems,
    customServices,
    setCustomServices,
    handleSelectOption: baseHandleSelectOption,
    handleSelectStorageItem,
    handleRemoveComponent,
    addCustomService,
    removeCustomService
  } = useComponentSelection();

  const {
    currentStep,
    setCurrentStep,
    showFinalSummary,
    setShowFinalSummary,
    isStepComplete: baseIsStepComplete
  } = useWizardSteps();

  // Função para verificar se o componente é de seleção única
  const isSingleSelectionComponent = (type: string): boolean => {
    const singleSelectionTypes = [
      "DataCenter",
      "Contrato",
      "Processador", 
      "Memória", 
      "SistemaOperacional"
    ];
    return singleSelectionTypes.includes(type);
  };

  // Função para avançar automaticamente após selecionar componente único
  const handleSelectOption = (option: ComponentOption) => {
    baseHandleSelectOption(option);
    
    // Verificar se o componente atual é de seleção única
    const currentComponent = serverData.componentes[currentStep];
    if (currentComponent && isSingleSelectionComponent(currentComponent.type)) {
      // Espera um pequeno delay para permitir que o estado seja atualizado
      setTimeout(() => {
        // Verificar se o passo atual está completo
        if (contextIsStepComplete(currentStep)) {
          // Avançar automaticamente para o próximo passo
          if (currentStep < serverData.componentes.length - 1) {
            setCurrentStep(currentStep + 1);
          }
        }
      }, 300);
    }
  };

  const handleRestart = () => {
    setSelectedComponents({});
    setConnectivityItems({});
    setStorageItems({ internal: [], external: [] });
    setCustomServices([]);
    setCurrentStep(0);
    setShowFinalSummary(false);
  };

  const contextIsStepComplete = (stepIndex: number) => {
    return baseIsStepComplete(stepIndex, selectedComponents, connectivityItems, storageItems);
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
        isStepComplete: contextIsStepComplete,
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
