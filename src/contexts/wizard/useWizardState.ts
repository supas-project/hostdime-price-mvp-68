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

  // CORREÇÃO PRINCIPAL: Reimplementação completa do handleRemoveComponent para garantir remoção robusta
  const handleRemoveComponent = useCallback((componentId: string, componentType?: string) => {
    console.log(`[handleRemoveComponent] Removendo componente: ID=${componentId}, Tipo=${componentType || 'não especificado'}`);
    
    // Verificar se o componentId é um disco interno específico
    if (componentId.startsWith('internal-disk-')) {
      console.log(`[handleRemoveComponent] Removendo disco interno: ${componentId}`);
      
      // CORREÇÃO CRÍTICA: Corrigir imutabilidade para garantir atualização de UI
      setStorageItems(prev => {
        // Encontra e remove o disco pelo ID exato
        const updatedInternal = prev.internal.filter(disk => disk.id !== componentId);
        console.log(`[handleRemoveComponent] Discos antes: ${prev.internal.length}, depois: ${updatedInternal.length}`);
        
        // Se nenhum disco foi removido, tentar buscar por substrings ou padrões no ID
        if (updatedInternal.length === prev.internal.length) {
          console.log(`[handleRemoveComponent] Tentando remoção alternativa para: ${componentId}`);
          
          // Tenta encontrar correspondências parciais
          const diskToRemove = prev.internal.find(disk => 
            disk.id.includes(componentId) || componentId.includes(disk.id)
          );
          
          if (diskToRemove) {
            console.log(`[handleRemoveComponent] Encontrado disco por correspondência parcial: ${diskToRemove.id}`);
            return {
              ...prev,
              internal: prev.internal.filter(disk => disk.id !== diskToRemove.id)
            };
          }
        }
        
        return {
          ...prev,
          internal: updatedInternal
        };
      });
      
      // CORREÇÃO: Também atualizar o selectedComponents para manter consistência
      setSelectedComponents(prev => {
        const newComponents = { ...prev };
        if (newComponents['storage_internal'] && 
            newComponents['storage_internal'].id === componentId) {
          delete newComponents['storage_internal'];
        }
        return newComponents;
      });
      
      return; // Termina aqui se for um disco interno
    }
    
    // Verificar se o componentId é um disco externo específico
    if (componentId.startsWith('external-storage-')) {
      console.log(`[handleRemoveComponent] Removendo storage externo: ${componentId}`);
      
      setStorageItems(prev => {
        const updatedExternal = prev.external.filter(storage => storage.id !== componentId);
        return {
          ...prev,
          external: updatedExternal
        };
      });
      
      // Atualizar selectedComponents para manter consistência
      setSelectedComponents(prev => {
        const newComponents = { ...prev };
        if (newComponents['storage_external'] && 
            newComponents['storage_external'].id === componentId) {
          delete newComponents['storage_external'];
        }
        return newComponents;
      });
      
      return; // Termina aqui se for um storage externo
    }
    
    // Caso seja um componente regular com tipo especificado
    if (componentType) {
      console.log(`[handleRemoveComponent] Removendo componente regular: ${componentType}, ID: ${componentId}`);
      
      // Normaliza o tipo para consistência
      const normalizedType = componentType.toLowerCase();
      
      setSelectedComponents(prev => {
        const newComponents = { ...prev };
        
        // Se o componente existir e tiver o ID especificado, remover
        if (newComponents[normalizedType] && 
            newComponents[normalizedType].id === componentId) {
          console.log(`[handleRemoveComponent] Removido componente: ${normalizedType}`);
          delete newComponents[normalizedType];
        } 
        // Se não encontrar pelo tipo+id, tentar apenas pelo ID
        else if (Object.values(newComponents).some(comp => comp.id === componentId)) {
          // Encontrar a chave do componente pelo ID
          const keyToRemove = Object.keys(newComponents).find(
            key => newComponents[key].id === componentId
          );
          
          if (keyToRemove) {
            console.log(`[handleRemoveComponent] Removido componente pela chave: ${keyToRemove}`);
            delete newComponents[keyToRemove];
          }
        }
        
        return newComponents;
      });
      
      return; // Termina aqui se for um componente regular
    }
    
    // Se chegarmos aqui, tenta remover usando o ID como tipo (último recurso)
    console.log(`[handleRemoveComponent] Tentando remoção pelo ID como tipo: ${componentId}`);
    
    setSelectedComponents(prev => {
      const newComponents = { ...prev };
      
      // Caso 1: ID é uma chave direta
      if (newComponents[componentId]) {
        console.log(`[handleRemoveComponent] Removido componente com ID como chave: ${componentId}`);
        delete newComponents[componentId];
        return newComponents;
      }
      
      // Caso 2: Procurar componente com este ID
      const keyWithId = Object.keys(newComponents).find(
        key => newComponents[key].id === componentId
      );
      
      if (keyWithId) {
        console.log(`[handleRemoveComponent] Encontrado e removido pelo ID: ${componentId}, chave: ${keyWithId}`);
        delete newComponents[keyWithId];
      }
      
      return newComponents;
    });
  }, [setStorageItems, setSelectedComponents]);

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
    handleRemoveComponent,
    removeComponent: handleRemoveComponent, // Alias para manter compatibilidade
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
    handleRemoveComponent: handleRemoveComponent, // Alias para manter compatibilidade
    categoriesLoaded,
    beginnerMode,
    setBeginnerMode,
    addCustomService,
    removeCustomService,
    setStorageItems
  };
}
