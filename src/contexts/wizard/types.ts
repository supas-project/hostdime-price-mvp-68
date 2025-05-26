
import { ComponentOption } from "@/types/component";

export interface StorageItems {
  internal: ComponentOption[];
  external: ComponentOption[];
}

export interface WizardContextProps {
  // Navigation
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  
  // Component Selection
  selectedComponents: { [key: string]: ComponentOption };
  setSelectedComponents: React.Dispatch<React.SetStateAction<{ [key: string]: ComponentOption }>>;
  handleSelectOption: (option: ComponentOption) => void;
  
  // Contract Selection
  selectedContractOption: ComponentOption | null;
  setSelectedContractOption: React.Dispatch<React.SetStateAction<ComponentOption | null>>;
  
  // Storage Management
  storageItems: StorageItems;
  setStorageItems: React.Dispatch<React.SetStateAction<StorageItems>>;
  handleSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
  
  // Connectivity Management
  connectivityItems: { [key: string]: { option: ComponentOption; quantity: number } };
  setConnectivityItems: React.Dispatch<React.SetStateAction<{ [key: string]: { option: ComponentOption; quantity: number } }>>;
  
  // Custom Services
  customServices: ComponentOption[];
  addCustomService: (service: ComponentOption) => void;
  removeCustomService: (id: string) => void;
  
  // Component Management
  handleRemoveComponent: (id: string, type?: string) => void;
  handleRestart: () => void;
  
  // Step Management
  isStepComplete: (stepIndex: number) => boolean;
  setStepComplete: (stepIndex: number, complete: boolean) => void;
  
  // UI State
  showFinalSummary: boolean;
  setShowFinalSummary: React.Dispatch<React.SetStateAction<boolean>>;
  beginnerMode: boolean;
  setBeginnerMode: (value: boolean) => void;
  categoriesLoaded: boolean;
}

export interface WizardProviderProps {
  children: React.ReactNode;
}
