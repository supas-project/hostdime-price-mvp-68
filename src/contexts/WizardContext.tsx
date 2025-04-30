
import { createContext, useContext, ReactNode, useEffect } from "react";
import { WizardContextType } from "@/types/wizard";
import { useComponentSelection, normalizeComponentType } from "@/hooks/use-component-selection";
import { useWizardSteps } from "@/hooks/use-wizard-steps";
import { ComponentOption } from "@/types/component";
import { serverData } from "@/data/server-components";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/component-selection/use-local-storage";

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
  
  // Use the correct hook format - default to false to disable beginner mode
  const [beginnerMode, setBeginnerMode] = useLocalStorage('beginnerMode', false);
  const [seenSteps, setSeenSteps] = useLocalStorage<number[]>('seenSteps', []);
  // Add a new state to track which steps have been automatically advanced through
  const [autoAdvancedSteps, setAutoAdvancedSteps] = useLocalStorage<number[]>('autoAdvancedSteps', []);
  
  // Define a wrapper function for setBeginnerMode that also handles side effects
  const updateBeginnerMode = (value: boolean) => {
    setBeginnerMode(value);
    
    // If turning on beginner mode, reset seen steps to show tooltips again
    if (value && !beginnerMode) {
      setSeenSteps([]);
    }
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
    console.log(`Checking if ${type} (normalized: ${normalizedType}) is single selection:`, 
      singleSelectionTypes.includes(normalizedType));
    
    return singleSelectionTypes.includes(normalizedType);
  };

  // Função melhorada para verificar se o passo está completo
  const contextIsStepComplete = (stepIndex: number) => {
    console.log(`contextIsStepComplete checking step ${stepIndex}`);
    const isComplete = baseIsStepComplete(stepIndex, selectedComponents, connectivityItems, storageItems);
    console.log(`Step ${stepIndex} complete check result: ${isComplete}`);
    return isComplete;
  };

  // Removed the useEffect that showed helpful messages for beginners

  // Efeito para monitorar mudanças nos componentes selecionados
  useEffect(() => {
    if (Object.keys(selectedComponents).length === 0) return;
    
    const currentComponent = serverData.componentes[currentStep];
    if (!currentComponent) return;
    
    const normalizedCurrentType = normalizeComponentType(currentComponent.type);
    console.log(`Current component type: ${currentComponent.type} (normalized: ${normalizedCurrentType})`);
    
    // Verifica se o componente atual foi selecionado
    if (isSingleSelectionComponent(currentComponent.type)) {
      console.log(`Checking if ${normalizedCurrentType} is in selectedComponents:`, 
        Object.keys(selectedComponents).map(k => normalizeComponentType(k)));
      
      const componentSelected = Object.keys(selectedComponents).some(key => 
        normalizeComponentType(key) === normalizedCurrentType);
      
      // Automatic navigation logic - only advance if step complete and we haven't already auto-advanced this step
      if (componentSelected) {
        console.log(`Component ${normalizedCurrentType} was selected, checking if step is complete`);
        const isComplete = contextIsStepComplete(currentStep);
        
        // Only advance if:
        // 1. The step is complete
        // 2. We haven't already auto-advanced this step before
        // 3. We're not at the last step
        if (isComplete && 
            !autoAdvancedSteps.includes(currentStep) && 
            currentStep < serverData.componentes.length - 1) {
          console.log(`Step ${currentStep} complete, advancing to next step`);
          // Add this step to the auto-advanced steps
          setAutoAdvancedSteps(prev => [...prev, currentStep]);
          setTimeout(() => {
            setCurrentStep(currentStep + 1);
            // No more toast notifications here
          }, 800);
        }
      }
    }
  }, [selectedComponents, currentStep]);

  // Função para avançar automaticamente após selecionar componente único
  const handleSelectOption = (option: ComponentOption) => {
    console.log(`handleSelectOption called with:`, option);
    baseHandleSelectOption(option);
    
    // Verificar se o componente atual é de seleção única
    const currentComponent = serverData.componentes[currentStep];
    console.log(`Current component:`, currentComponent);
    
    if (currentComponent && isSingleSelectionComponent(currentComponent.type)) {
      console.log(`${currentComponent.type} is a single selection component, will check for auto-progression`);
      
      // Espera um delay maior para permitir que o estado seja atualizado completamente
      setTimeout(() => {
        console.log(`setTimeout executed, checking if step ${currentStep} is complete`);
        
        // Verificar se o passo atual está completo
        const isComplete = contextIsStepComplete(currentStep);
        console.log(`Step ${currentStep} complete: ${isComplete}`);
        
        // Only auto-advance if we haven't already auto-advanced this step before
        if (isComplete && !autoAdvancedSteps.includes(currentStep)) {
          // Avançar automaticamente para o próximo passo
          if (currentStep < serverData.componentes.length - 1) {
            console.log(`Auto-advancing to step ${currentStep + 1}`);
            // Add this step to the auto-advanced steps
            setAutoAdvancedSteps(prev => [...prev, currentStep]);
            setCurrentStep(currentStep + 1);
            // No toast notification here anymore
          } else {
            console.log(`Already at last step, not advancing`);
          }
        } else {
          console.log(`Step already auto-advanced before or not complete, not advancing`);
        }
      }, 1000);
    } else {
      console.log(`${currentComponent?.type || 'Unknown'} is not a single selection component, no auto-progression`);
    }
  };

  const handleRestart = () => {
    setSelectedComponents({});
    setConnectivityItems({});
    setStorageItems({ internal: [], external: [] });
    setCustomServices([]);
    setCurrentStep(0);
    setShowFinalSummary(false);
    
    // Reset seen steps when restarting
    setSeenSteps([]);
    // Also reset auto-advanced steps
    setAutoAdvancedSteps([]);
    
    toast.info("Configuração reiniciada", {
      description: "Vamos começar do zero!",
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
        setBeginnerMode: updateBeginnerMode // Expose the wrapper function
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
