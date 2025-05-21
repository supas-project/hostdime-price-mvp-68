
import React from "react";
import WizardContext from "./WizardContext";
import { useWizardState } from "./useWizardState";
import { WizardProviderProps } from "./types";

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const wizardState = useWizardState();
  
  return (
    <WizardContext.Provider value={wizardState}>
      {children}
    </WizardContext.Provider>
  );
};
