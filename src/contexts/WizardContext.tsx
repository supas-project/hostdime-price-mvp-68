
import React, { createContext, useContext } from "react";
import { WizardProvider as NewWizardProvider } from "./wizard";
import { useWizardState } from "./wizard/useWizardState";
import type { WizardContextProps } from "./wizard/types";

// Create the context
const WizardContext = createContext<WizardContextProps | null>(null);

// Export the new provider and hook for compatibility
export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <NewWizardProvider>{children}</NewWizardProvider>;
};

export const useWizard = (): WizardContextProps => {
  const context = useContext(WizardContext);
  if (!context) {
    // If no context, use the hook directly
    return useWizardState();
  }
  return context;
};

// Export the context for the provider
export default WizardContext;

// Export the type for compatibility
export type { WizardContextProps };
