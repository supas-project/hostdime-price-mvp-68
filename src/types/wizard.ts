import { ComponentOption } from "./component";
import { ReactNode } from "react";

export type WizardContextType = {
  currentStep: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
  selectedComponents: Record<string, ComponentOption>;
  setSelectedComponents: (components: Record<string, ComponentOption>) => void;
  connectivityItems: Record<string, { option: ComponentOption, quantity: number }>;
  setConnectivityItems: (items: Record<string, { option: ComponentOption, quantity: number }>) => void;
  showFinalSummary: boolean;
  setShowFinalSummary: (show: boolean) => void;
  handleSelectOption: (option: ComponentOption) => void;
  handleRestart: () => void;
  isStepComplete: (stepIndex: number) => boolean;
  handleSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
  handleRemoveComponent: (typeOrId: string) => void;
  storageItems: {
    internal: ComponentOption[];
    external: ComponentOption[];
  };
  customServices: ComponentOption[];
  addCustomService: (service: ComponentOption) => void;
  removeCustomService: (serviceId: string) => void;
  beginnerMode: boolean;
  setBeginnerMode: (enabled: boolean) => void;
  // Added new properties for progress tracking
  completedSteps?: boolean[];
  calculateProgress?: () => number;
};
