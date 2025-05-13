
import { useState } from "react";
import { serverData } from "@/data/server-components";
import { normalizeComponentType } from "./use-component-selection";
import { ComponentOption } from "@/types/component";

export function useWizardSteps() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  const isStepComplete = (
    stepIndex: number, 
    selectedComponents: Record<string, ComponentOption>, 
    connectivityItems: Record<string, { option: ComponentOption, quantity: number }>, 
    storageItems: { internal: ComponentOption[], external: ComponentOption[] }
  ): boolean => {
    const component = serverData.componentes[stepIndex];
    if (!component) return false;

    const normalizedType = normalizeComponentType(component.type);

    // Serviços Personalizados é o único passo opcional
    if (normalizedType === "servicospersonalizados") {
      return true; // Sempre considerado completo, já que é opcional
    }
    
    if (normalizedType === "memoria") {
      return Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === "memoria"
      );
    } else if (normalizedType === "contrato") {
      return Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === "contrato"
      );
    } else if (normalizedType === "conectividade") {
      const hasPort = Object.values(connectivityItems).some(
        item => item.option.subtype === "porta"
      );
      const hasIp = Object.values(connectivityItems).some(
        item => item.option.subtype === "ip"
      );
      return hasPort && hasIp;
    } else if (normalizedType === "armazenamento") {
      // Modificado para exigir pelo menos um armazenamento interno
      return storageItems.internal.length > 0;
    } else if (normalizedType === "sistemaoperacional") {
      return Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === "sistemaoperacional"
      );
    } else {
      // Caso padrão, usando o tipo normalizado para verificar
      return Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === normalizedType
      );
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
