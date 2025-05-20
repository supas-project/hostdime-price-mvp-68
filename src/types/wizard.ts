

import { ComponentOption } from "./component";

export interface StorageItems {
  internal: ComponentOption[];
  external: ComponentOption[];
}

// Update CustomService to extend ComponentOption to ensure type compatibility
export interface CustomService extends ComponentOption {
  // Additional fields specific to CustomService can be added here
}

export interface WizardContextType {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  selectedComponents: { [key: string]: ComponentOption };
  setSelectedComponents: React.Dispatch<React.SetStateAction<{ [key: string]: ComponentOption }>>;
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } };
  setConnectivityItems: React.Dispatch<React.SetStateAction<{ [key: string]: { option: ComponentOption, quantity: number } }>>;
  storageItems: StorageItems;
  showFinalSummary: boolean;
  setShowFinalSummary: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectOption: (option: ComponentOption) => void;
  handleRestart: () => void;
  isStepComplete: (stepIndex: number) => boolean;
  handleSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
  handleRemoveComponent: (id: string, type?: string) => void;
  customServices: ComponentOption[]; // Changed from CustomService[] to ComponentOption[]
  addCustomService: (service: ComponentOption) => void;
  removeCustomService: (id: string) => void;
  beginnerMode: boolean;
  setBeginnerMode: (value: boolean) => void; // Add the setter function
  categoriesLoaded: boolean; // Added this property to fix the TypeScript error
}

// Interface para lidar com ambos os formatos de armazenamento (array e objeto)
export interface StorageItemsMap {
  [key: string]: { option: ComponentOption; quantity: number };
}

// Add new helper interface to convert between formats
export interface ConnectivityItemsMap {
  [key: string]: { option: ComponentOption; quantity: number };
}
