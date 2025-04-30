
import { useState } from "react";
import { serverData } from "@/data/server-components";
import { normalizeComponentType } from "./use-component-selection";

export function useWizardSteps() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  const isStepComplete = (stepIndex: number, selectedComponents: any, connectivityItems: any, storageItems: any) => {
    const component = serverData.componentes[stepIndex];
    if (!component) return false;

    const type = component.type;
    const normalizedType = normalizeComponentType(type);
    
    console.log(`Checking completion for type: ${type} (normalized: ${normalizedType})`);
    console.log(`Selected components:`, selectedComponents);

    // Serviços Personalizados é o único passo opcional
    if (type === "ServiçosPersonalizados") {
      console.log(`${type} is optional, marking as complete`);
      return true;
    }
    
    if (type === "Memória") {
      const isComplete = selectedComponents["memoria"] !== undefined;
      console.log(`Memory completion: ${isComplete}`, selectedComponents["memoria"]);
      return isComplete;
    } else if (type === "Contrato") {
      const isComplete = selectedComponents["contrato"] !== undefined;
      console.log(`Contract completion: ${isComplete}`, selectedComponents["contrato"]);
      return isComplete;
    } else if (type === "Conectividade") {
      const hasPort = Object.values(connectivityItems).some(
        (item: any) => item.option.subtype === "porta"
      );
      const hasIp = Object.values(connectivityItems).some(
        (item: any) => item.option.subtype === "ip"
      );
      const isComplete = hasPort && hasIp;
      console.log(`Connectivity completion: ${isComplete} (port: ${hasPort}, ip: ${hasIp})`);
      return isComplete;
    } else if (type === "Armazenamento") {
      // Modificado para exigir pelo menos um armazenamento interno
      const hasInternalStorage = storageItems.internal.length > 0;
      console.log(`Storage completion: ${hasInternalStorage} (internal items: ${storageItems.internal.length})`);
      return hasInternalStorage;
    } else if (type === "SistemaOperacional") {
      const isComplete = selectedComponents["sistemaoperacional"] !== undefined;
      console.log(`OS completion: ${isComplete}`, selectedComponents["sistemaoperacional"]);
      return isComplete;
    } else {
      // Caso padrão, usando o tipo normalizado para verificar
      const isComplete = selectedComponents[normalizedType] !== undefined;
      console.log(`Standard component completion for ${normalizedType}: ${isComplete}`, selectedComponents[normalizedType]);
      return isComplete;
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
