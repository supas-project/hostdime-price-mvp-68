
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
    console.log(`Selected components keys:`, Object.keys(selectedComponents).map(k => normalizeComponentType(k)));

    // Serviços Personalizados é o único passo opcional
    if (normalizedType === "servicospersonalizados") {
      console.log(`${type} is optional, marking as complete`);
      return true;
    }
    
    if (normalizedType === "memoria") {
      const hasMemory = Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === "memoria"
      );
      console.log(`Memory completion: ${hasMemory}`, 
        Object.keys(selectedComponents).filter(k => normalizeComponentType(k) === "memoria"));
      return hasMemory;
    } else if (normalizedType === "contrato") {
      const hasContract = Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === "contrato"
      );
      console.log(`Contract completion: ${hasContract}`, 
        Object.keys(selectedComponents).filter(k => normalizeComponentType(k) === "contrato"));
      return hasContract;
    } else if (normalizedType === "conectividade") {
      const hasPort = Object.values(connectivityItems).some(
        (item: any) => item.option.subtype === "porta"
      );
      const hasIp = Object.values(connectivityItems).some(
        (item: any) => item.option.subtype === "ip"
      );
      const isComplete = hasPort && hasIp;
      console.log(`Connectivity completion: ${isComplete} (port: ${hasPort}, ip: ${hasIp})`);
      return isComplete;
    } else if (normalizedType === "armazenamento") {
      // Modificado para exigir pelo menos um armazenamento interno
      const hasInternalStorage = storageItems.internal.length > 0;
      console.log(`Storage completion: ${hasInternalStorage} (internal items: ${storageItems.internal.length})`);
      return hasInternalStorage;
    } else if (normalizedType === "sistemaoperacional") {
      const hasOS = Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === "sistemaoperacional"
      );
      console.log(`OS completion: ${hasOS}`, 
        Object.keys(selectedComponents).filter(k => normalizeComponentType(k) === "sistemaoperacional"));
      return hasOS;
    } else {
      // Caso padrão, usando o tipo normalizado para verificar
      const hasComponent = Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === normalizedType
      );
      console.log(`Standard component completion for ${normalizedType}: ${hasComponent}`, 
        Object.keys(selectedComponents).filter(k => normalizeComponentType(k) === normalizedType));
      return hasComponent;
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
