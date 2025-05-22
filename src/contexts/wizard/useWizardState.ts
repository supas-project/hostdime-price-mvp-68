import { useState, useCallback, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { serverData } from "@/data/server-components";
import { syncDiskDataWithPriceService, initExternalStorageData, syncConnectivityData } from "@/services/component-sync";
import { ConnectivityItemsMap } from "@/types/wizard";

export function useWizardState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedComponents, setSelectedComponents] = useState<{
    [key: string]: ComponentOption;
  }>({});
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    new Array(serverData.componentes.length).fill(false)
  );
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  
  const [storageItems, setStorageItems] = useState<{
    internal: ComponentOption[];
    external: ComponentOption[];
  }>({
    internal: [],
    external: []
  });
  
  const [connectivityItems, setConnectivityItems] = useState<ConnectivityItemsMap>({});
  const [customServices, setCustomServices] = useState<ComponentOption[]>([]);

  // Função para selecionar um componente
  const selectComponent = useCallback((
    componentType: string,
    option: ComponentOption,
    quantity: number
  ) => {
    console.log(`[WizardState] Selecionando componente tipo: ${componentType}, nome: ${option.name}`);
    
    // Corrigindo caso específico do DataCenter, garantindo que seja armazenado com a chave correta
    const adjustedType = option.type === "DataCenter" ? "datacenter" : componentType;
    
    setSelectedComponents((prevComponents) => {
      const newComponents = {
        ...prevComponents,
        [adjustedType]: option,
      };
      console.log(`[WizardState] Componentes atualizados:`, newComponents);
      return newComponents;
    });
  }, []);

  // Wrapper para selectComponent com quantidade padrão 1
  const handleSelectOption = useCallback((option: ComponentOption) => {
    console.log(`[WizardState] handleSelectOption chamado para: ${option.type} - ${option.name}`);
    
    // Normalizar o tipo para minúsculo para consistência
    const normalizedType = option.type.toLowerCase();
    selectComponent(normalizedType, option, 1);
  }, [selectComponent]);

  // Função para selecionar itens de armazenamento
  const handleSelectStorageItem = useCallback((option: ComponentOption, storageType: 'internal' | 'external') => {
    const key = storageType === 'internal' ? 'storage_internal' : 'storage_external';
    setStorageItems(prev => {
      const updatedItems = { ...prev };
      if (storageType === 'internal') {
        updatedItems.internal = [...updatedItems.internal, option];
      } else {
        updatedItems.external = [...updatedItems.external, option];
      }
      return updatedItems;
    });
    selectComponent(key, option, 1);
  }, [selectComponent]);

  // Função para atualizar quantidade de componentes
  const updateComponentQuantity = useCallback((
    componentType: string,
    optionId: string,
    quantity: number
  ) => {
    // Implementação existente (mantida vazia neste exemplo)
  }, []);

  // Função para remover componentes
  const removeComponent = useCallback((componentType: string, optionId: string) => {
    setSelectedComponents((prevComponents) => {
      const newComponents = { ...prevComponents };
      if (
        newComponents[componentType] &&
        newComponents[componentType].id === optionId
      ) {
        delete newComponents[componentType];
      }
      return newComponents;
    });
  }, []);

  // Wrapper para removeComponent que aceita parâmetro optionId opcional
  const handleRemoveComponent = useCallback((componentType: string, optionId?: string) => {
    if (optionId) {
      removeComponent(componentType, optionId);
    } else {
      removeComponent(componentType, componentType);
    }
  }, [removeComponent]);

  // Verifica se um componente está selecionado
  const isComponentSelected = useCallback((componentType: string, optionId: string) => {
    const component = selectedComponents[componentType];
    return component ? component.id === optionId : false;
  }, [selectedComponents]);

  // Retorna a quantidade de um componente
  const getComponentQuantity = useCallback((componentType: string, optionId: string) => {
    const component = selectedComponents[componentType];
    return component ? 1 : 0;
  }, [selectedComponents]);

  // Verifica se um passo está completo
  const isStepComplete = useCallback((stepIndex: number) => {
    return completedSteps[stepIndex] || false;
  }, [completedSteps]);

  // Define se um passo está completo
  const setStepComplete = useCallback((stepIndex: number, complete: boolean) => {
    setCompletedSteps((prev) => {
      const newCompletedSteps = [...prev];
      newCompletedSteps[stepIndex] = complete;
      return newCompletedSteps;
    });
  }, []);

  // Reinicia o wizard
  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setSelectedComponents({});
    setShowFinalSummary(false);
    setCompletedSteps(new Array(serverData.componentes.length).fill(false));
    setStorageItems({ internal: [], external: [] });
    setConnectivityItems({});
    setCustomServices([]);
  }, []);

  // Funções para serviços personalizados
  const addCustomService = useCallback((option: ComponentOption) => {
    setCustomServices(prev => [...prev, option]);
  }, []);

  const removeCustomService = useCallback((optionId: string) => {
    setCustomServices(prev => prev.filter(service => service.id !== optionId));
  }, []);

  // Sincroniza dados na inicialização
  useEffect(() => {
    // Initialize data from PriceService
    syncDiskDataWithPriceService();

    // Initialize external storage data
    initExternalStorageData();
    
    // Sincronizar dados de conectividade
    syncConnectivityData().then(() => {
      setCategoriesLoaded(true);
    });
  
  }, []); // dependencies array

  return {
    currentStep,
    setCurrentStep,
    selectedComponents,
    selectComponent,
    updateComponentQuantity,
    removeComponent,
    isComponentSelected,
    getComponentQuantity,
    showFinalSummary,
    setShowFinalSummary,
    isStepComplete,
    setStepComplete,
    completedSteps,
    handleRestart,
    storageItems,
    connectivityItems,
    customServices,
    handleSelectOption,
    setConnectivityItems,
    handleSelectStorageItem,
    handleRemoveComponent,
    categoriesLoaded,
    beginnerMode,
    setBeginnerMode,
    addCustomService,
    removeCustomService
  };
}
