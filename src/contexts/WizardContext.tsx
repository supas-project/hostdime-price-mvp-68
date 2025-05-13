
import { createContext, useContext, ReactNode, useEffect, useCallback } from "react";
import { WizardContextType, CustomService } from "@/types/wizard";
import { useComponentSelection, normalizeComponentType } from "@/hooks/use-component-selection";
import { useWizardSteps } from "@/hooks/use-wizard-steps";
import { ComponentOption } from "@/types/component";
import { serverData } from "@/data/server-components";
import { useLocalStorage } from "@/hooks/component-selection/use-local-storage";
import { toast } from "sonner";

export const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const {
    selectedComponents,
    setSelectedComponents,
    connectivityItems,
    setConnectivityItems,
    storageItems,
    setStorageItems,
    customServices: baseCustomServices,
    setCustomServices: baseSetCustomServices,
    handleSelectOption: baseHandleSelectOption,
    handleSelectStorageItem,
    handleRemoveComponent,
    addCustomService: baseAddCustomService,
    removeCustomService: baseRemoveCustomService
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
  
  // Type-safe custom services handlers
  const customServices = baseCustomServices as CustomService[];
  
  const addCustomService = (service: CustomService) => {
    baseAddCustomService(service as any);
  };
  
  const removeCustomService = (id: string) => {
    baseRemoveCustomService(id);
  };
  
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

  // Memoized version of handleSelectOption to prevent unnecessary recreation
  const handleSelectOption = useCallback((option: ComponentOption) => {
    try {
      if (!option) return;
      
      // Specially handle DataCenter component to prevent freezing
      if (option.type === "DataCenter" || normalizeComponentType(option.type) === "datacenter") {
        // Direct state update for data center to avoid race conditions
        setSelectedComponents(prev => ({
          ...prev,
          [option.type]: option
        }));
        return;
      }
      
      // Use the base handler for all other component types
      baseHandleSelectOption(option);
    } catch (error) {
      console.error("Error in handleSelectOption:", error);
      toast.error("Ocorreu um erro ao selecionar a opção. Tente novamente.");
    }
  }, [baseHandleSelectOption, setSelectedComponents]);

  // Auto-advancement with protections against freezes
  useEffect(() => {
    // Skip if no components selected
    if (Object.keys(selectedComponents).length === 0) return;
    
    const currentComponent = serverData.componentes[currentStep];
    if (!currentComponent) return;
    
    // Skip auto-advancement if not in beginner mode
    if (!beginnerMode) return;
    
    // Wait for a stable state before attempting auto-advancement
    const normalizedCurrentType = normalizeComponentType(currentComponent.type);
    
    // Check if component of current step is selected
    const componentSelected = Object.keys(selectedComponents).some(key => 
      normalizeComponentType(key) === normalizedCurrentType);
    
    // Only try auto-advancement if this component has been selected
    if (componentSelected) {
      const isComplete = contextIsStepComplete(currentStep);
      
      // Conditions for auto-advancement
      if (isComplete && 
          !autoAdvancedSteps.includes(currentStep) && 
          currentStep < serverData.componentes.length - 1) {
        
        // Record that we've auto-advanced this step
        setAutoAdvancedSteps(prev => [...prev, currentStep]);
        
        // Increased timeout for better stability
        const autoAdvanceTimeout = setTimeout(() => {
          setCurrentStep(currentStep + 1);
        }, 1000);
        
        // Clean up timeout if component unmounts or dependencies change
        return () => clearTimeout(autoAdvanceTimeout);
      }
    }
  }, [
    selectedComponents, 
    currentStep, 
    beginnerMode, 
    autoAdvancedSteps, 
    setAutoAdvancedSteps, 
    setCurrentStep
  ]);

  const handleRestart = () => {
    try {
      setSelectedComponents({});
      setConnectivityItems({});
      setStorageItems({ internal: [], external: [] });
      baseSetCustomServices([]);
      setCurrentStep(0);
      setShowFinalSummary(false);
      
      // Reset auto-advanced steps when restarting
      setAutoAdvancedSteps([]);
      
      // Show success message
      toast.success("Configuração reiniciada", {
        description: "Você pode começar novamente a configuração do seu servidor."
      });
    } catch (error) {
      console.error("Error restarting configuration:", error);
      toast.error("Erro ao reiniciar a configuração. Tente novamente.");
    }
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
