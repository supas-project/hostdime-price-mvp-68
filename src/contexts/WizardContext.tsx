
import React, { createContext, useContext, ReactNode } from 'react';
import { ComponentOption, ConnectivityItem } from '@/types/component';
import { useWizardContext } from '@/hooks/use-wizard-context';

interface WizardContextType {
  selectedComponents: { [key: string]: ComponentOption | null };
  setSelectedComponents: React.Dispatch<React.SetStateAction<{ [key: string]: ComponentOption | null }>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } };
  setConnectivityItems: React.Dispatch<React.SetStateAction<{ [key: string]: { option: ComponentOption, quantity: number } }>>;
  handleSelectOption: (option: ComponentOption) => void;
  handleSelectStorageItem: (option: ComponentOption, storageType: 'internal' | 'external') => void;
  isStepComplete: (step: number) => boolean;
  categoriesLoaded: boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const wizardState = useWizardContext();
  
  return (
    <WizardContext.Provider value={wizardState}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  
  return context;
}
