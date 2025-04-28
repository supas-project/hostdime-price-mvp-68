
import { ComponentOption, StorageItems } from "./component";

export interface WizardContextType {
  currentStep: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
  selectedComponents: { [key: string]: ComponentOption };
  setSelectedComponents: (components: { [key: string]: ComponentOption }) => void;
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } };
  setConnectivityItems: (items: { [key: string]: { option: ComponentOption, quantity: number } }) => void;
  showFinalSummary: boolean;
  setShowFinalSummary: (show: boolean) => void;
  handleSelectOption: (option: ComponentOption) => void;
  handleRestart: () => void;
  isStepComplete: (stepIndex: number) => boolean;
  handleSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
  handleRemoveComponent: (type: string) => void;
  storageItems: StorageItems;
  customServices: ComponentOption[];
  addCustomService: (service: ComponentOption) => void;
  removeCustomService: (serviceId: string) => void;
}
