
import { useState, useEffect, useCallback } from 'react';
import { ComponentOption } from '@/types/component';
import { initializeServerCategories, registerComponentSyncListeners } from '@/services/component-sync';
import { PriceService } from '@/services/price-service';
import { toast } from '@/utils/toast-utils';

export function useWizardContext() {
  // State for tracking categories loading state
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  
  // Component selection state
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: ComponentOption | null }>({});
  
  // Current step in the wizard
  const [currentStep, setCurrentStep] = useState(0);
  
  // Special state for connectivity items (which can have multiple selections)
  const [connectivityItems, setConnectivityItems] = useState<{ [key: string]: { option: ComponentOption, quantity: number } }>({});
  
  // State for storage items
  const [storageItems, setStorageItems] = useState<{ internal: ComponentOption[], external: ComponentOption[] }>({
    internal: [],
    external: []
  });
  
  // State for custom services
  const [customServices, setCustomServices] = useState<ComponentOption[]>([]);
  
  // State for beginner mode
  const [beginnerMode, setBeginnerMode] = useState(true);
  
  // State for showing final summary
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  
  // Function to manually refresh categories
  const refreshCategories = useCallback(async () => {
    try {
      setCategoriesLoaded(false);
      // Force refresh of price data from source
      await PriceService.forceRefreshFromLatestSource();
      // Then initialize server categories
      await initializeServerCategories();
      setCategoriesLoaded(true);
      toast.success("Categorias e componentes atualizados com sucesso!");
    } catch (error) {
      console.error("Error refreshing categories:", error);
      toast.error("Falha ao atualizar categorias. Tente novamente.");
      setCategoriesLoaded(true);
    }
  }, []);
  
  // Initialize categories from price table data
  useEffect(() => {
    const initializeCategories = async () => {
      try {
        console.log("Initializing categories from price data");
        setCategoriesLoaded(false);
        
        // First force refresh from latest source
        try {
          await PriceService.forceRefreshFromLatestSource();
        } catch (error) {
          console.warn("Could not force refresh price data, using existing data:", error);
        }
        
        // Sync components with price data
        const success = await initializeServerCategories();
        
        // Register listener for future changes
        registerComponentSyncListeners();
        
        setCategoriesLoaded(true);
        
        if (!success) {
          console.warn("Categories initialization completed with warnings");
        } else {
          console.log("Categories initialized successfully");
        }
      } catch (error) {
        console.error("Error initializing categories:", error);
        setCategoriesLoaded(true);
      }
    };
    
    initializeCategories();
    
    // Set up periodic automatic refresh
    const intervalId = setInterval(() => {
      console.log("Running scheduled category refresh");
      initializeServerCategories().catch(err => 
        console.error("Scheduled category refresh failed:", err)
      );
    }, 120000); // Refresh every 2 minutes
    
    return () => clearInterval(intervalId);
  }, []);

  // Handle component selection
  const handleSelectOption = (option: ComponentOption) => {
    // Determine the key based on component type
    const componentType = option.subtype || option.type || 'unknown';
    
    setSelectedComponents(prev => ({
      ...prev,
      [componentType]: option
    }));
  };
  
  // Handle storage item selection (which is special because it can be internal or external)
  const handleSelectStorageItem = (option: ComponentOption, storageType: 'internal' | 'external') => {
    if (storageType === 'internal') {
      setStorageItems(prev => ({
        ...prev,
        internal: [...prev.internal, option]
      }));
      
      const key = 'storage_internal';
      setSelectedComponents(prev => ({
        ...prev,
        [key]: option
      }));
    } else {
      setStorageItems(prev => ({
        ...prev,
        external: [...prev.external, option]
      }));
      
      const key = 'storage_external';
      setSelectedComponents(prev => ({
        ...prev,
        [key]: option
      }));
    }
  };
  
  // Handle removing a component
  const handleRemoveComponent = (id: string, type?: string) => {
    // Remove from selectedComponents if type is provided
    if (type) {
      setSelectedComponents(prev => {
        const newComponents = { ...prev };
        delete newComponents[type];
        return newComponents;
      });
    }
    
    // Remove from internal storage
    setStorageItems(prev => ({
      ...prev,
      internal: prev.internal.filter(item => item.id !== id)
    }));
    
    // Remove from external storage
    setStorageItems(prev => ({
      ...prev,
      external: prev.external.filter(item => item.id !== id)
    }));
    
    // Remove from connectivity items
    setConnectivityItems(prev => {
      const newItems = { ...prev };
      if (newItems[id]) {
        delete newItems[id];
      }
      return newItems;
    });
    
    // Remove from custom services
    setCustomServices(prev => prev.filter(service => service.id !== id));
  };
  
  // Add a custom service
  const addCustomService = (service: ComponentOption) => {
    setCustomServices(prev => [...prev, service]);
  };
  
  // Remove a custom service
  const removeCustomService = (id: string) => {
    setCustomServices(prev => prev.filter(service => service.id !== id));
  };
  
  // Restart the wizard
  const handleRestart = () => {
    setSelectedComponents({});
    setCurrentStep(0);
    setConnectivityItems({});
    setStorageItems({ internal: [], external: [] });
    setCustomServices([]);
    setShowFinalSummary(false);
  };
  
  // Check if the current step is complete
  const isStepComplete = (step: number) => {
    // Logic to determine if a step is complete based on selections
    // This would depend on the specific requirements for each step
    return false; // Simplistic implementation - should be expanded based on actual needs
  };
  
  return {
    selectedComponents,
    setSelectedComponents,
    currentStep,
    setCurrentStep,
    connectivityItems,
    setConnectivityItems,
    handleSelectOption,
    handleSelectStorageItem,
    isStepComplete,
    categoriesLoaded,
    storageItems,
    customServices,
    handleRemoveComponent,
    handleRestart,
    showFinalSummary,
    setShowFinalSummary,
    addCustomService,
    removeCustomService,
    beginnerMode,
    setBeginnerMode,
    refreshCategories
  };
}
