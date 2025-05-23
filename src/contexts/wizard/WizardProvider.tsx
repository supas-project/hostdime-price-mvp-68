
import React from "react";
import WizardContext from "./WizardContext";
import { useWizardState } from "./useWizardState";
import { WizardProviderProps } from "./types";

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const wizardState = useWizardState();
  
  // Garantir que todas as propriedades, incluindo setSelectedComponents, estão disponíveis no contexto
  const contextValue = {
    ...wizardState
  };
  
  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
};
