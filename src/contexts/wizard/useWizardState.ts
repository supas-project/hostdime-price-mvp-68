
import { useState, useCallback, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { serverData } from "@/data/server-components";
import { ConnectivityItemsMap } from "@/types/wizard";
import { normalizeComponentType } from "@/hooks/use-component-selection";

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
  const [categoriesLoaded, setCategoriesLoaded] = useState(true); // Static data is always loaded
  
  const [storageItems, setStorageItems] = useState<{
    internal: ComponentOption[];
    external: ComponentOption[];
  }>({
    internal: [],
    external: []
  });
  
  const [connectivityItems, setConnectivityItems] = useState<ConnectivityItemsMap>({});
  const [customServices, setCustomServices] = useState<ComponentOption[]>([]);

  useEffect(() => {
    console.log("[useWizardState] Estado inicial de componentes selecionados:", selectedComponents);
  }, []);

  const selectComponent = useCallback((
    componentType: string,
    option: ComponentOption,
    quantity: number
  ) => {
    console.log(`[selectComponent] Selecionando componente tipo: ${componentType}, opção:`, option);
    
    let normalizedType = componentType.toLowerCase();
    
    if (normalizedType === "datacenter") {
      normalizedType = "datacenter";
    } else if (normalizedType === "contrato") {
      normalizedType = "contrato";
    }
    
    setSelectedComponents((prevComponents) => {
      const newComponents = {
        ...prevComponents,
        [normalizedType]: option,
      };
      
      console.log(`[selectComponent] Componentes atualizados:`, newComponents);
      return newComponents;
    });
  }, []);

  const handleSelectOption = useCallback((option: ComponentOption) => {
    console.log(`[handleSelectOption] Selecionando opção:`, option);
    
    const normalizedType = option.type.toLowerCase();
    selectComponent(normalizedType, option, 1);
  }, [selectComponent]);

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

  const updateComponentQuantity = useCallback((
    componentType: string,
    optionId: string,
    quantity: number
  ) => {
    // Implementation can be added if needed
  }, []);

  const handleRemoveComponent = useCallback((componentId: string, componentType?: string) => {
    console.log(`[handleRemoveComponent] Removendo componente: ID=${componentId}, Tipo=${componentType || 'não especificado'}`);
    
    if (componentId.startsWith('network-') || componentId.startsWith('ip-')) {
      console.log(`[handleRemoveComponent] Removendo item de conectividade: ${componentId}`);
      
      setConnectivityItems(prev => {
        const newItems = { ...prev };
        if (newItems[componentId]) {
          delete newItems[componentId];
          console.log(`[handleRemoveComponent] Item de conectividade removido: ${componentId}`);
        } else {
          const keyToRemove = Object.keys(newItems).find(k => 
            k.includes(componentId) || componentId.includes(k)
          );
          
          if (keyToRemove) {
            delete newItems[keyToRemove];
            console.log(`[handleRemoveComponent] Item de conectividade removido via busca parcial: ${keyToRemove}`);
          }
        }
        return newItems;
      });
      
      return;
    }
    
    if (componentId.startsWith('internal-disk-')) {
      console.log(`[handleRemoveComponent] Removendo disco interno: ${componentId}`);
      
      setStorageItems(prev => {
        const updatedInternal = prev.internal.filter(disk => disk.id !== componentId);
        console.log(`[handleRemoveComponent] Discos antes: ${prev.internal.length}, depois: ${updatedInternal.length}`);
        
        if (updatedInternal.length === prev.internal.length) {
          console.log(`[handleRemoveComponent] Tentando remoção alternativa para: ${componentId}`);
          
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
      
      setSelectedComponents(prev => {
        const newComponents = { ...prev };
        if (newComponents['storage_internal'] && 
            newComponents['storage_internal'].id === componentId) {
          delete newComponents['storage_internal'];
        }
        return newComponents;
      });
      
      return;
    }
    
    if (componentId.startsWith('external-storage-')) {
      console.log(`[handleRemoveComponent] Removendo storage externo: ${componentId}`);
      
      setStorageItems(prev => {
        const updatedExternal = prev.external.filter(storage => storage.id !== componentId);
        return {
          ...prev,
          external: updatedExternal
        };
      });
      
      setSelectedComponents(prev => {
        const newComponents = { ...prev };
        if (newComponents['storage_external'] && 
            newComponents['storage_external'].id === componentId) {
          delete newComponents['storage_external'];
        }
        return newComponents;
      });
      
      return;
    }
    
    if (componentType) {
      console.log(`[handleRemoveComponent] Removendo componente regular: ${componentType}, ID: ${componentId}`);
      
      const normalizedType = componentType.toLowerCase();
      
      setSelectedComponents(prev => {
        const newComponents = { ...prev };
        
        if (newComponents[normalizedType] && 
            newComponents[normalizedType].id === componentId) {
          console.log(`[handleRemoveComponent] Removido componente: ${normalizedType}`);
          delete newComponents[normalizedType];
        } 
        else if (Object.values(newComponents).some(comp => comp.id === componentId)) {
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
      
      return;
    }
    
    console.log(`[handleRemoveComponent] Tentando remoção pelo ID como tipo: ${componentId}`);
    
    setSelectedComponents(prev => {
      const newComponents = { ...prev };
      
      if (newComponents[componentId]) {
        console.log(`[handleRemoveComponent] Removido componente com ID como chave: ${componentId}`);
        delete newComponents[componentId];
        return newComponents;
      }
      
      const keyWithId = Object.keys(newComponents).find(
        key => newComponents[key].id === componentId
      );
      
      if (keyWithId) {
        console.log(`[handleRemoveComponent] Encontrado e removido pelo ID: ${componentId}, chave: ${keyWithId}`);
        delete newComponents[keyWithId];
      }
      
      return newComponents;
    });
  }, [setStorageItems, setSelectedComponents, setConnectivityItems]);

  const isComponentSelected = useCallback((componentType: string, optionId: string) => {
    const component = selectedComponents[componentType];
    return component ? component.id === optionId : false;
  }, [selectedComponents]);

  const getComponentQuantity = useCallback((componentType: string, optionId: string) => {
    const component = selectedComponents[componentType];
    return component ? 1 : 0;
  }, [selectedComponents]);

  const isStepComplete = useCallback((stepIndex: number) => {
    const component = serverData.componentes[stepIndex];
    if (!component) return false;

    const normalizedType = normalizeComponentType(component.type);
    
    console.log(`[isStepComplete] Verificando etapa ${stepIndex}, tipo: ${component.type}, normalizado: ${normalizedType}`);
    console.log(`[isStepComplete] Componentes selecionados:`, selectedComponents);

    if (normalizedType === "servicospersonalizados") {
      return true;
    }
    
    if (["datacenter", "contrato", "processador", "memoria", "sistemaoperacional"].includes(normalizedType)) {
      const hasSelection = Object.keys(selectedComponents).some(key => {
        const keyNormalized = normalizeComponentType(key);
        const matches = keyNormalized === normalizedType;
        console.log(`[isStepComplete] Comparando chave '${key}' (${keyNormalized}) com tipo '${normalizedType}': ${matches}`);
        return matches;
      });
      console.log(`[isStepComplete] Categoria '${normalizedType}' tem seleção: ${hasSelection}`);
      return hasSelection;
    }
    
    if (normalizedType === "conectividade") {
      const hasPort = Object.values(connectivityItems).some(
        item => item.option.subtype === "porta"
      );
      const hasIp = Object.values(connectivityItems).some(
        item => item.option.subtype === "ip"
      );
      const complete = hasPort && hasIp;
      console.log(`[isStepComplete] Conectividade completa: ${complete}, porta: ${hasPort}, IP: ${hasIp}`);
      return complete;
    }
    
    if (normalizedType === "armazenamento") {
      const complete = storageItems.internal.length > 0;
      console.log(`[isStepComplete] Armazenamento completo: ${complete}, discos internos: ${storageItems.internal.length}`);
      return complete;
    }
    
    return false;
  }, [selectedComponents, connectivityItems, storageItems]);

  const setStepComplete = useCallback((stepIndex: number, complete: boolean) => {
    setCompletedSteps((prev) => {
      const newCompletedSteps = [...prev];
      newCompletedSteps[stepIndex] = complete;
      return newCompletedSteps;
    });
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setSelectedComponents({});
    setShowFinalSummary(false);
    setCompletedSteps(new Array(serverData.componentes.length).fill(false));
    setStorageItems({ internal: [], external: [] });
    setConnectivityItems({});
    setCustomServices([]);
  }, []);

  const addCustomService = useCallback((option: ComponentOption) => {
    setCustomServices(prev => [...prev, option]);
  }, []);

  const removeCustomService = useCallback((optionId: string) => {
    setCustomServices(prev => prev.filter(service => service.id !== optionId));
  }, []);

  // No initialization needed since we're using static data
  useEffect(() => {
    setCategoriesLoaded(true);
  }, []);

  return {
    currentStep,
    setCurrentStep,
    selectedComponents,
    setSelectedComponents,
    selectComponent,
    updateComponentQuantity,
    handleRemoveComponent,
    removeComponent: handleRemoveComponent,
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
    categoriesLoaded,
    beginnerMode,
    setBeginnerMode,
    addCustomService,
    removeCustomService,
    setStorageItems
  };
}
