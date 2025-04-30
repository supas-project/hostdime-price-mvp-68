
import { createContext, useContext, ReactNode, useEffect } from "react";
import { WizardContextType } from "@/types/wizard";
import { useComponentSelection, normalizeComponentType } from "@/hooks/use-component-selection";
import { useWizardSteps } from "@/hooks/use-wizard-steps";
import { ComponentOption } from "@/types/component";
import { serverData } from "@/data/server-components";
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
      
      if (componentSelected) {
        console.log(`Component ${normalizedCurrentType} was selected, checking if step is complete`);
        const isComplete = contextIsStepComplete(currentStep);
        
        if (isComplete && currentStep < serverData.componentes.length - 1) {
          console.log(`Step ${currentStep} complete, advancing to next step`);
          setTimeout(() => {
            setCurrentStep(currentStep + 1);
            // Toast removido para evitar poluição visual
          }, 800); // Aumentado para 800ms
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
        
        if (isComplete) {
          // Avançar automaticamente para o próximo passo
          if (currentStep < serverData.componentes.length - 1) {
            console.log(`Auto-advancing to step ${currentStep + 1}`);
            setCurrentStep(currentStep + 1);
            // Toast removido para evitar poluição visual
          } else {
            console.log(`Already at last step, not advancing`);
          }
        } else {
          console.log(`Step not complete, not advancing`);
        }
      }, 1000); // Aumentado para 1000ms para garantir que o estado foi atualizado
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
