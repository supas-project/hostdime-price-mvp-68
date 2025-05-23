
import React from "react";
import { ComponentOption } from "@/types/component";
import { CustomService } from "@/types/wizard";

export interface WizardProviderProps {
  children: React.ReactNode;
}

export interface WizardContextProps {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  selectedComponents: { [key: string]: ComponentOption };
  setSelectedComponents: React.Dispatch<React.SetStateAction<{ [key: string]: ComponentOption }>>;
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } };
  setConnectivityItems: React.Dispatch<React.SetStateAction<{ [key: string]: { option: ComponentOption, quantity: number } }>>;
  storageItems: {
    internal: ComponentOption[];
    external: ComponentOption[];
  };
  showFinalSummary: boolean;
  setShowFinalSummary: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectOption: (option: ComponentOption) => void;
  handleRestart: () => void;
  isStepComplete: (stepIndex: number) => boolean;
  handleSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
  handleRemoveComponent: (id: string, type?: string) => void;
  customServices: ComponentOption[];
  addCustomService: (service: ComponentOption) => void;
  removeCustomService: (id: string) => void;
  beginnerMode: boolean;
  setBeginnerMode: (value: boolean) => void;
  categoriesLoaded: boolean;
}
