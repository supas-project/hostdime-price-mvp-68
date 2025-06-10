
import React from "react";
import { WizardProvider as NewWizardProvider } from "./wizard";
import { useWizard as newUseWizard } from "./wizard/WizardContext";
import type { WizardContextProps } from "./wizard/types";

// Exportar o novo provider e hook para manter compatibilidade com o código existente
export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <NewWizardProvider>{children}</NewWizardProvider>;
};

export const useWizard = newUseWizard;

// Exportando o tipo para manter compatibilidade com o código existente
export type { WizardContextProps };
