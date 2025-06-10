
import React from "react";
import WizardContext from "../WizardContext";
import { useWizardState } from "./useWizardState";
import { WizardProviderProps } from "./types";

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const wizardState = useWizardState();
  
  const contextValue = {
    ...wizardState,
    setSelectedComponents: wizardState.setSelectedComponents
  };
  
  console.log("[WizardProvider] setSelectedComponents disponível:", !!contextValue.setSelectedComponents);
  
  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
};
