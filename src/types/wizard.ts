
import { ComponentOption } from "@/types/component";

export interface CustomService {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  selected: boolean;
  metadata?: {
    quantity?: number;
  };
  specs?: string[];
}

export interface WizardContextType {
  currentStep: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
  selectedComponents: { [key: string]: ComponentOption };
  setSelectedComponents: React.Dispatch<React.SetStateAction<{ [key: string]: ComponentOption }>>;
  connectivityItems: { 
    [key: string]: { 
      option: ComponentOption; 
      quantity: number;
    } 
  };
  setConnectivityItems: React.Dispatch<React.SetStateAction<{ 
    [key: string]: { 
      option: ComponentOption; 
      quantity: number;
    } 
  }>>;
  showFinalSummary: boolean;
  setShowFinalSummary: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectOption: (option: ComponentOption) => void;
  handleRestart: () => void;
  isStepComplete: (stepIndex: number) => boolean;
  handleSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
  handleRemoveComponent: (type: string) => void;
  storageItems: {
    internal: ComponentOption[];
    external: ComponentOption[];
  };
  customServices: CustomService[];
  addCustomService: (service: CustomService) => void;
  removeCustomService: (id: string) => void;
  beginnerMode: boolean;
  setBeginnerMode: (mode: boolean) => void;
  completedSteps: boolean[];
  calculateProgress: () => number;
}
