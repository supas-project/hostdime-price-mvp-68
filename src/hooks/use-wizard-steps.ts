
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

    let hasComponent = false;
    
    if (type === "Memória") {
      hasComponent = selectedComponents["memoria"] !== undefined;
    } else if (type === "Contrato") {
      hasComponent = selectedComponents["contrato"] !== undefined;
    } else if (type === "Conectividade") {
      const hasPort = Object.values(connectivityItems).some(
        (item: any) => item.option.subtype === "porta"
      );
      const hasIp = Object.values(connectivityItems).some(
        (item: any) => item.option.subtype === "ip"
      );
      hasComponent = hasPort && hasIp;
    } else if (type === "Armazenamento") {
      const hasInternalStorage = storageItems.internal.length > 0;
      const hasExternalStorage = storageItems.external.length > 0;
      hasComponent = hasInternalStorage || hasExternalStorage;
    } else if (type === "SistemaOperacional") {
      hasComponent = selectedComponents["sistemaoperacional"] !== undefined;
    } else if (type === "ServiçosPersonalizados") {
      hasComponent = true;
    } else {
      const typeKey = type.toLowerCase();
      hasComponent = selectedComponents[typeKey] !== undefined;
    }

    return hasComponent;
  };

  return {
    currentStep,
    setCurrentStep,
    showFinalSummary,
    setShowFinalSummary,
    isStepComplete
  };
}
