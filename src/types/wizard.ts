
import { ComponentOption } from "./component";

export interface StorageItems {
  internal: ComponentOption[];
  external: ComponentOption[];
}

export interface CustomService {
  id: string;
  name: string;
  description: string;
  price: number;
  specs?: string[];
  metadata?: {
    quantity?: number;
  };
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
  customServices: CustomService[];
  addCustomService: (service: CustomService) => void;
  removeCustomService: (id: string) => void;
  beginnerMode?: boolean; // New property for beginner mode
}
