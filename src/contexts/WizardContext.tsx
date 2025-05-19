
import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { WizardContextType } from "@/types/wizard";
import { useComponentSelection, normalizeComponentType } from "@/hooks/use-component-selection";
import { useWizardSteps } from "@/hooks/use-wizard-steps";
import { ComponentOption } from "@/types/component";
import { serverData } from "@/data/server-components";
import { useLocalStorage } from "@/hooks/component-selection/use-local-storage";
import { PriceService } from "@/services/price-service";
import { initializeServerCategories } from "@/services/component-sync-service";
import { toast } from "sonner";

export const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [dataInitialized, setDataInitialized] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  
  // Inicializar dados da tabela de preços
  useEffect(() => {
    const initData = async () => {
      try {
        // Check authentication first
        const { data: session } = await PriceService.supabase.auth.getSession();
        
        if (!session.session) {
          console.log("User not authenticated, skipping data initialization in WizardContext");
          setDataInitialized(true);
          setInitializationAttempted(true);
          return;
        }
        
        console.log("User authenticated, initializing data in WizardContext");
        
        try {
          // Primeiro, forçar atualização dos dados do serviço de preços
          await PriceService.forceRefreshFromLatestSource();
          
          // Então inicializar categorias necessárias se estiverem faltando
          await initializeServerCategories();
          
          // Marcar como inicializado
          setDataInitialized(true);
        } catch (error) {
          console.error("Erro ao carregar dados iniciais:", error);
          if (error instanceof Error && !error.message.includes("Authentication")) {
            toast.error("Erro ao inicializar categorias", {
              description: "Verifique o console para mais detalhes."
            });
          }
          setDataInitialized(true); // Mark as initialized anyway to avoid loading forever
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setDataInitialized(true); // Mark as initialized anyway to avoid loading forever
      } finally {
        setInitializationAttempted(true);
      }
    };
    
    if (!initializationAttempted) {
      initData();
    }
  }, [initializationAttempted]);

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
    categoriesLoaded
  } = useWizardSteps();
  
  // Use the correct hook format - default to false to disable beginner mode
  const [beginnerMode, setBeginnerMode] = useLocalStorage('beginnerMode', false);
  // Remove unused seenSteps state
  const [autoAdvancedSteps, setAutoAdvancedSteps] = useLocalStorage<number[]>('autoAdvancedSteps', []);
  
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
  const contextIsStepComplete = (stepIndex: number) => {
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
  };

  if (!dataInitialized && !categoriesLoaded && initializationAttempted) {
    // Renderizar um estado de carregamento até que os dados estejam prontos
    return <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
        <div className="text-sm text-muted-foreground">Carregando configurações...</div>
      </div>
    </div>;
  }

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
        categoriesLoaded
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
