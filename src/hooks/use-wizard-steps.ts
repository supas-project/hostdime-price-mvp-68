
import { useState, useEffect, useCallback } from "react";
import { serverData } from "@/data/server-components";
import { normalizeComponentType } from "./use-component-selection";
import { ComponentOption } from "@/types/component";

export function useWizardSteps() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);

  // Initialize completed steps
  useEffect(() => {
    const initialCompletedSteps = Array(serverData.componentes.length).fill(false);
    setCompletedSteps(initialCompletedSteps);
  }, []);

  // Memoize the step completion check for performance
  const isStepComplete = useCallback(
    (
      stepIndex: number, 
      selectedComponents: Record<string, ComponentOption>, 
      connectivityItems: Record<string, { option: ComponentOption, quantity: number }>, 
      storageItems: { internal: ComponentOption[], external: ComponentOption[] }
    ): boolean => {
      try {
        const component = serverData.componentes[stepIndex];
        if (!component) return false;

        const normalizedType = normalizeComponentType(component.type);
        
        // Compute step completion
        let isComplete = false;

        // Serviços Personalizados é o único passo opcional
        if (normalizedType === "servicospersonalizados") {
          isComplete = true;
        } else if (normalizedType === "memoria") {
          isComplete = Object.keys(selectedComponents).some(
            key => normalizeComponentType(key) === "memoria"
          );
        } else if (normalizedType === "contrato") {
          isComplete = Object.keys(selectedComponents).some(
            key => normalizeComponentType(key) === "contrato"
          );
        } else if (normalizedType === "conectividade") {
          const hasPort = Object.values(connectivityItems).some(
            item => item && item.option && item.option.subtype === "porta"
          );
          const hasIp = Object.values(connectivityItems).some(
            item => item && item.option && item.option.subtype === "ip"
          );
          isComplete = hasPort && hasIp;
        } else if (normalizedType === "armazenamento") {
          // Modificado para exigir pelo menos um armazenamento interno
          isComplete = Array.isArray(storageItems.internal) && storageItems.internal.length > 0;
        } else if (normalizedType === "sistemaoperacional") {
          isComplete = Object.keys(selectedComponents).some(
            key => normalizeComponentType(key) === "sistemaoperacional"
          );
        } else if (normalizedType === "datacenter") {
          // Verifique especificamente para o DataCenter
          isComplete = Object.keys(selectedComponents).some(
            key => normalizeComponentType(key) === "datacenter"
          );
        } else {
          // Caso padrão, usando o tipo normalizado para verificar
          isComplete = Object.keys(selectedComponents).some(
            key => normalizeComponentType(key) === normalizedType
          );
        }

        // Update the completed steps array safely
        setCompletedSteps(prev => {
          const newCompletedSteps = [...prev];
          // Ensure the index exists before setting it
          if (stepIndex >= 0 && stepIndex < newCompletedSteps.length) {
            newCompletedSteps[stepIndex] = isComplete;
          }
          return newCompletedSteps;
        });

        return isComplete;
      } catch (error) {
        console.error("Error checking step completion:", error);
        return false;
      }
    },
    []
  );

  // Calculate overall progress percentage with error handling
  const calculateProgress = useCallback((): number => {
    try {
      const totalSteps = serverData.componentes.length;
      if (totalSteps === 0) return 0;
      
      const completedCount = completedSteps.filter(Boolean).length;
      return (completedCount / totalSteps) * 100;
    } catch (error) {
      console.error("Error calculating progress:", error);
      return 0;
    }
  }, [completedSteps]);

  return {
    currentStep,
    setCurrentStep,
    showFinalSummary,
    setShowFinalSummary,
    isStepComplete,
    completedSteps,
    calculateProgress
  };
}
