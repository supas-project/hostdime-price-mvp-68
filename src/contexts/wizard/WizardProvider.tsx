
import React from "react";
import WizardContext from "./WizardContext";
import { useWizardState } from "./useWizardState";
import { WizardProviderProps } from "./types";

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const wizardState = useWizardState();
  
  // Make sure all properties from useWizardState match WizardContextProps interface
  const contextValue = {
    ...wizardState,
    setSelectedComponents: wizardState.setSelectedComponents
  };
  
  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
};
