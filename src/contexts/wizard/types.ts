
import { ComponentOption } from "@/types/component";
import { ConnectivityItemsMap } from "@/types/wizard";

export interface WizardContextProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedComponents: { [key: string]: ComponentOption };
  selectComponent: (
    componentType: string,
    option: ComponentOption,
    quantity: number
  ) => void;
  updateComponentQuantity: (
    componentType: string,
    optionId: string,
    quantity: number
  ) => void;
  removeComponent: (componentType: string, optionId: string) => void;
  isComponentSelected: (componentType: string, optionId: string) => boolean;
  getComponentQuantity: (componentType: string, optionId: string) => number;
  showFinalSummary: boolean;
  setShowFinalSummary: (show: boolean) => void;
  isStepComplete: (stepIndex: number) => boolean;
  setStepComplete: (stepIndex: number, complete: boolean) => void;
  completedSteps: boolean[];
  handleRestart: () => void;
  // Propriedades para armazenamento
  storageItems: { 
    internal: ComponentOption[]; 
    external: ComponentOption[]; 
  };
  connectivityItems: ConnectivityItemsMap;
  customServices: ComponentOption[];
  handleSelectOption: (option: ComponentOption) => void;
  setConnectivityItems: (items: ConnectivityItemsMap) => void;
  handleSelectStorageItem: (option: ComponentOption, storageType: 'internal' | 'external') => void;
  handleRemoveComponent: (componentType: string, optionId?: string) => void;
  categoriesLoaded: boolean;
  beginnerMode: boolean;
  setBeginnerMode: (mode: boolean) => void;
  addCustomService?: (option: ComponentOption) => void;
  removeCustomService?: (optionId: string) => void;
}

export interface WizardProviderProps {
  children: React.ReactNode;
}
