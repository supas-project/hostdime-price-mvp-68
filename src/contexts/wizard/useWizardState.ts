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

  // CORREÇÃO: Log para debug do estado inicial
  useEffect(() => {
    console.log("[useWizardState] Estado inicial de componentes selecionados:", selectedComponents);
  }, []);

  // Função para selecionar um componente
  const selectComponent = useCallback((
    componentType: string,
    option: ComponentOption,
    quantity: number
  ) => {
    // CORREÇÃO: Log de debug para a seleção de componentes
    console.log(`[selectComponent] Selecionando componente tipo: ${componentType}, opção:`, option);
    
    // CORREÇÃO: Garantir que estamos usando a chave correta para salvar no estado
    let normalizedType = componentType.toLowerCase();
    
    // Ajustes específicos para DataCenter e Contrato
    if (normalizedType === "datacenter") {
      normalizedType = "datacenter";
    } else if (normalizedType === "contrato") {
      normalizedType = "contrato";
    }
    
    // Atualizar o estado com a nova seleção
    setSelectedComponents((prevComponents) => {
      const newComponents = {
        ...prevComponents,
        [normalizedType]: option,
      };
      
      console.log(`[selectComponent] Componentes atualizados:`, newComponents);
      return newComponents;
    });
  }, []);

  // Wrapper para selectComponent com quantidade padrão 1
  const handleSelectOption = useCallback((option: ComponentOption) => {
    // CORREÇÃO: Log para debug
    console.log(`[handleSelectOption] Selecionando opção:`, option);
    
    // Garantir que estamos usando o tipo correto
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

  // Função para remover componentes - CORREÇÃO CRÍTICA
  const removeComponent = useCallback((componentType: string, optionId: string) => {
    // Log mais detalhado para debug
    console.log(`[removeComponent] Removendo componente tipo: ${componentType}, id: ${optionId}`);
    
    // CORREÇÃO: Verificar primeiro se é um disco interno ou externo
    setStorageItems(prev => {
      // Verificar discos internos
      const internalIndex = prev.internal.findIndex(item => item.id === optionId);
      if (internalIndex >= 0) {
        const newInternal = [...prev.internal];
        newInternal.splice(internalIndex, 1);
        console.log(`[removeComponent] Disco interno removido, restantes: ${newInternal.length}`);
        return { ...prev, internal: newInternal };
      }
      
      // Verificar storage externo
      const externalIndex = prev.external.findIndex(item => item.id === optionId);
      if (externalIndex >= 0) {
        const newExternal = [...prev.external];
        newExternal.splice(externalIndex, 1);
        console.log(`[removeComponent] Disco externo removido, restantes: ${newExternal.length}`);
        return { ...prev, external: newExternal };
      }
      
      return prev;
    });
    
    // Verificar itens de conectividade
    setConnectivityItems(prev => {
      if (prev[optionId]) {
        const newItems = { ...prev };
        delete newItems[optionId];
        console.log(`[removeComponent] Item de conectividade removido: ${optionId}`);
        return newItems;
      }
      return prev;
    });
    
    // Verificar serviços personalizados
    setCustomServices(prev => {
      const serviceIndex = prev.findIndex(service => service.id === optionId);
      if (serviceIndex >= 0) {
        const newServices = [...prev];
        newServices.splice(serviceIndex, 1);
        console.log(`[removeComponent] Serviço personalizado removido: ${optionId}`);
        return newServices;
      }
      return prev;
    });
    
    // Por fim, verificar componentes regulares
    setSelectedComponents((prevComponents) => {
      const newComponents = { ...prevComponents };
      
      // Normalizar o tipo para consistência
      const normalizedType = componentType.toLowerCase();
      
      if (
        newComponents[normalizedType] &&
        newComponents[normalizedType].id === optionId
      ) {
        delete newComponents[normalizedType];
        console.log(`[removeComponent] Componente regular removido: ${normalizedType}`);
      } else if (optionId && newComponents[optionId]) {
        // Tenta remover diretamente pelo ID como chave
        delete newComponents[optionId];
        console.log(`[removeComponent] Componente removido pelo ID como chave: ${optionId}`);
      }
      
      console.log(`[removeComponent] Componentes após remoção:`, newComponents);
      return newComponents;
    });
  }, []);

  // CORREÇÃO PRINCIPAL: Implementação robusta para lidar com remoção de componentes
  const handleRemoveComponent = useCallback((componentId: string, componentType?: string) => {
    console.log(`[handleRemoveComponent] Removendo: id=${componentId}, tipo=${componentType || 'não especificado'}`);
    
    // Caso 1: Se temos ID e tipo, usamos ambos
    if (componentType) {
      removeComponent(componentType, componentId);
      return;
    }
    
    // Caso 2: Se o ID for um disco específico (verificação direta na lista de storage)
    let removedFromStorage = false;
    
    // Verificar e remover disco interno
    setStorageItems(prev => {
      const internalIndex = prev.internal.findIndex(item => item.id === componentId);
      if (internalIndex >= 0) {
        removedFromStorage = true;
        const newInternal = [...prev.internal];
        newInternal.splice(internalIndex, 1);
        console.log(`[handleRemoveComponent] Disco interno removido diretamente, restantes: ${newInternal.length}`);
        return { ...prev, internal: newInternal };
      }
      
      // Verificar e remover storage externo
      const externalIndex = prev.external.findIndex(item => item.id === componentId);
      if (externalIndex >= 0) {
        removedFromStorage = true;
        const newExternal = [...prev.external];
        newExternal.splice(externalIndex, 1);
        console.log(`[handleRemoveComponent] Disco externo removido diretamente, restantes: ${newExternal.length}`);
        return { ...prev, external: newExternal };
      }
      
      return prev;
    });
    
    if (removedFromStorage) {
      return; // Se já removemos da lista de storage, não precisamos continuar
    }
    
    // Caso 3: Se o ID contiver '_' (como storage_internal), tratar especialmente
    if (componentId.includes('_')) {
      const parts = componentId.split('_');
      if (parts.length > 1) {
        // Se for storage_internal ou storage_external, limpar toda a lista correspondente
        if (componentId === 'storage_internal') {
          setStorageItems(prev => ({ ...prev, internal: [] }));
          console.log('[handleRemoveComponent] Removidos todos os discos internos');
          return;
        }
        if (componentId === 'storage_external') {
          setStorageItems(prev => ({ ...prev, external: [] }));
          console.log('[handleRemoveComponent] Removidos todos os storages externos');
          return;
        }
        
        // Se for outro formato composto, tentar remover por tipo e ID
        removeComponent(parts[0], componentId);
        return;
      }
    }
    
    // Caso 4: Último recurso, tratar o ID como tipo e como ID
    removeComponent(componentId, componentId);
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
    setSelectedComponents, // Garantir que isso é explicitamente incluído no valor de retorno
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
    removeCustomService,
    setStorageItems
  };
}
