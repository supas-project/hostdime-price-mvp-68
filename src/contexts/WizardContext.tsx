
import { createContext, useContext, ReactNode, useEffect } from "react";
import { WizardContextType } from "@/types/wizard";
import { useComponentSelection, normalizeComponentType } from "@/hooks/use-component-selection";
import { useWizardSteps } from "@/hooks/use-wizard-steps";
import { ComponentOption } from "@/types/component";
import { serverData } from "@/data/server-components";
import { useLocalStorage } from "@/hooks/component-selection/use-local-storage";
import { toast } from "@/hooks/use-toast";

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
    isStepComplete: baseIsStepComplete,
    completedSteps,
    calculateProgress
  } = useWizardSteps();
  
  // Use the correct hook format - default to false to disable beginner mode
  const [beginnerMode, setBeginnerMode] = useLocalStorage('beginnerMode', false);
  // Remove unused seenSteps state
  const [autoAdvancedSteps, setAutoAdvancedSteps] = useLocalStorage<number[]>('autoAdvancedSteps', []);
  
  // Debug selected components
  useEffect(() => {
    console.log("Selected components updated:", selectedComponents);
    // Calculate steps completion
    serverData.componentes.forEach((_, index) => {
      const isComplete = contextIsStepComplete(index);
      console.log(`Step ${index + 1} complete:`, isComplete);
    });
  }, [selectedComponents, connectivityItems, storageItems]);
  
  // Função para verificar se o componente é de seleção única - caso insensitivo
  const isSingleSelectionComponent = (type: string): boolean => {
    if (!type) return false;
    
    const singleSelectionTypes = [
      "datacenter",
      "contrato",
      "processador", 
      "memória", 
      "memoria",
      "sistemaoperacional"
    ];
    
    const normalizedType = normalizeComponentType(type);
    return singleSelectionTypes.includes(normalizedType);
  };

  // Função melhorada para verificar se o passo está completo
  const contextIsStepComplete = (stepIndex: number): boolean => {
    const isComplete = baseIsStepComplete(stepIndex, selectedComponents, connectivityItems, storageItems);
    return isComplete;
  };

  // Efeito para monitorar mudanças nos componentes selecionados
  useEffect(() => {
    if (Object.keys(selectedComponents).length === 0) return;
    
    const currentComponent = serverData.componentes[currentStep];
    if (!currentComponent) return;
    
    const normalizedCurrentType = normalizeComponentType(currentComponent.type);
    
    // Verifica se o componente atual foi selecionado
    if (isSingleSelectionComponent(currentComponent.type)) {
      const componentSelected = Object.keys(selectedComponents).some(key => 
        normalizeComponentType(key) === normalizedCurrentType);
      
      // Automatic navigation logic - only advance if step complete and we haven't already auto-advanced this step
      if (componentSelected) {
        const isComplete = contextIsStepComplete(currentStep);
        
        // Only advance if:
        // 1. The step is complete
        // 2. We haven't already auto-advanced this step before
        // 3. We're not at the last step
        if (isComplete && 
            !autoAdvancedSteps.includes(currentStep) && 
            currentStep < serverData.componentes.length - 1) {
          // Add this step to the auto-advanced steps
          setAutoAdvancedSteps(prev => [...prev, currentStep]);
          // Reduced timeout for better performance
          setTimeout(() => {
            setCurrentStep(currentStep + 1);
          }, 500);
        }
      }
    }
  }, [selectedComponents, currentStep]);

  // Simplified function that removes the duplicate auto-navigation logic
  const handleSelectOption = (option: ComponentOption) => {
    // Debug OS selection
    if (option.type === "SistemaOperacional" || normalizeComponentType(option.type) === "sistemaoperacional") {
      console.log("Selecting OS:", option);
    }
    
    baseHandleSelectOption(option);
  };

  const handleRestart = () => {
    setSelectedComponents({});
    setConnectivityItems({});
    setStorageItems({ internal: [], external: [] });
    setCustomServices([]);
    setCurrentStep(0);
    setShowFinalSummary(false);
    
    // Reset auto-advanced steps when restarting
    setAutoAdvancedSteps([]);
    
    toast.info({
      title: "Configuração reiniciada",
      description: "Você pode começar novamente a configuração do seu servidor."
    });
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
        removeCustomService,
        beginnerMode,
        setBeginnerMode,
        completedSteps,
        calculateProgress
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
