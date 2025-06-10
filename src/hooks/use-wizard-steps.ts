
import { useState, useEffect } from "react";
import { serverData } from "@/data/server-components";
import { normalizeComponentType } from "./use-component-selection";
import { ComponentOption } from "@/types/component";

export function useWizardSteps() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(true); // Always true for static data

  useEffect(() => {
    console.log("[useWizardSteps] Using static component data");
    setCategoriesLoaded(true);
  }, []);

  const isStepComplete = (
    stepIndex: number, 
    selectedComponents: Record<string, ComponentOption>, 
    connectivityItems: Record<string, { option: ComponentOption, quantity: number }>, 
    storageItems: { internal: ComponentOption[], external: ComponentOption[] }
  ): boolean => {
    const component = serverData.componentes[stepIndex];
    if (!component) return false;

    const normalizedType = normalizeComponentType(component.type);
    
    console.log(`[isStepComplete] Verificando etapa ${stepIndex}, tipo: ${component.type}, normalizado: ${normalizedType}`);

    // Serviços Personalizados é o único passo opcional
    if (normalizedType === "servicospersonalizados") {
      return true;
    }
    
    if (normalizedType === "memoria") {
      return Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === "memoria"
      );
    } else if (normalizedType === "datacenter") {
      return Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === "datacenter"
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
      return storageItems.internal.length > 0;
    } else if (normalizedType === "sistemaoperacional") {
      return Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === "sistemaoperacional"
      );
    } else {
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
    isStepComplete,
    categoriesLoaded
  };
}
