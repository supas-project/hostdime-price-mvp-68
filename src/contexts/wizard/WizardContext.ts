
import { createContext, useContext } from "react";
import { WizardContextProps } from "./types";

const WizardContext = createContext<WizardContextProps | undefined>(undefined);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};

export default WizardContext;
