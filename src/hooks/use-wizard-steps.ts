
import { useState, useEffect } from "react";
import { serverData } from "@/data/server-components";
import { normalizeComponentType } from "./use-component-selection";
import { ComponentOption } from "@/types/component";
import { PriceService } from "@/services/price-service"; // Importando o serviço

export function useWizardSteps() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Adicionar carregar as categorias da tabela de preços ao inicializar
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Carregar dados do serviço de preços para garantir que temos os dados mais recentes
        await PriceService.forceRefreshFromLatestSource();
        setCategoriesLoaded(true);
        
        // CORREÇÃO: Log para debug
        console.log("[useWizardSteps] Categorias carregadas com sucesso");
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };
    
    loadCategories();
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
    
    // CORREÇÃO: Log para debug da verificação de completude da etapa
    console.log(`[isStepComplete] Verificando etapa ${stepIndex}, tipo: ${component.type}, normalizado: ${normalizedType}`);
    console.log(`[isStepComplete] Componentes selecionados:`, selectedComponents);

    // Serviços Personalizados é o único passo opcional
    if (normalizedType === "servicospersonalizados") {
      return true; // Sempre considerado completo, já que é opcional
    }
    
    if (normalizedType === "memoria") {
      return Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === "memoria"
      );
    } else if (normalizedType === "datacenter") {
      // CORREÇÃO: Verificar componentes de datacenter corretamente
      return Object.keys(selectedComponents).some(
        key => normalizeComponentType(key) === "datacenter"
      );
    } else if (normalizedType === "contrato") {
      // CORREÇÃO: Verificar componentes de contrato corretamente
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
    isStepComplete,
    categoriesLoaded
  };
}
