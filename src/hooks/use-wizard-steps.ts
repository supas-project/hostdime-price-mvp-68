
import { useState } from "react";
import { serverData } from "@/data/server-components";

export function useWizardSteps() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  const isStepComplete = (stepIndex: number, selectedComponents: any, connectivityItems: any, storageItems: any) => {
    const component = serverData.componentes[stepIndex];
    if (!component) return false;

    const type = component.type;
    console.log(`Checking completion for type: ${type}`);

    // Serviços Personalizados é o único passo opcional
    if (type === "ServiçosPersonalizados") {
      return true;
    }
    
    if (type === "Memória") {
      return selectedComponents["memoria"] !== undefined;
    } else if (type === "Contrato") {
      return selectedComponents["contrato"] !== undefined;
    } else if (type === "Conectividade") {
      const hasPort = Object.values(connectivityItems).some(
        (item: any) => item.option.subtype === "porta"
      );
      const hasIp = Object.values(connectivityItems).some(
        (item: any) => item.option.subtype === "ip"
      );
      return hasPort && hasIp;
    } else if (type === "Armazenamento") {
      // Modificado para exigir pelo menos um armazenamento interno
      const hasInternalStorage = storageItems.internal.length > 0;
      return hasInternalStorage;
    } else if (type === "SistemaOperacional") {
      return selectedComponents["sistemaoperacional"] !== undefined;
    } else {
      const typeKey = type.toLowerCase();
      return selectedComponents[typeKey] !== undefined;
    }
  };

  return {
    currentStep,
    setCurrentStep,
    showFinalSummary,
    setShowFinalSummary,
    isStepComplete
  };
}
