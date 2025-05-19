
import { useState, useEffect } from 'react';
import { ComponentOption, ConnectivityItem } from '@/types/component';
import { initializeServerCategories, registerComponentSyncListeners } from '@/services/component-sync';

export function useWizardContext() {
  // State for tracking categories loading state
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  
  // Component selection state
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: ComponentOption | null }>({});
  
  // Current step in the wizard
  const [currentStep, setCurrentStep] = useState(0);
  
  // Special state for connectivity items (which can have multiple selections)
  const [connectivityItems, setConnectivityItems] = useState<{ [key: string]: { option: ComponentOption, quantity: number } }>({});
  
  // Initialize categories from price table data
  useEffect(() => {
    const initializeCategories = async () => {
      try {
        console.log("Initializing categories from price data");
        setCategoriesLoaded(false);
        
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
    const key = storageType === 'internal' ? 'storage_internal' : 'storage_external';
    
    setSelectedComponents(prev => ({
      ...prev,
      [key]: option
    }));
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
    categoriesLoaded
  };
}
