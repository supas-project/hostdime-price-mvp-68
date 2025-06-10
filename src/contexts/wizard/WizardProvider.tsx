
import React from "react";
import WizardContext from "./WizardContext";
import { useWizardState } from "./useWizardState";
import { WizardProviderProps } from "./types";

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const wizardState = useWizardState();
  
  // CORREÇÃO CRÍTICA: Garantir explicitamente que setSelectedComponents está disponível no contexto
  const contextValue = {
    ...wizardState,
    // Garantir explicitamente que setSelectedComponents está no valor do contexto
    setSelectedComponents: wizardState.setSelectedComponents
  };
  
  // Console log para verificar se setSelectedComponents está acessível
  console.log("[WizardProvider] setSelectedComponents disponível:", !!contextValue.setSelectedComponents);
  
  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
};
