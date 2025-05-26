
import { useState, useEffect, useCallback } from "react";
import { ComponentOption } from "@/types/component";
import { normalizeComponentType } from "./use-component-selection";

interface AutoProgressionConfig {
  enabled: boolean;
  fastMode: boolean;
  delay: number;
}

interface UseAutoProgressionProps {
  currentStep: number;
  totalSteps: number;
  selectedComponents: { [key: string]: ComponentOption };
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } };
  storageItems: { internal: ComponentOption[], external: ComponentOption[] };
  onNextStep: () => void;
  componentType: string;
  isStepComplete: (stepIndex: number) => boolean;
}

export function useAutoProgression({
  currentStep,
  totalSteps,
  selectedComponents,
  connectivityItems,
  storageItems,
  onNextStep,
  componentType,
  isStepComplete
}: UseAutoProgressionProps) {
  const [config, setConfig] = useState<AutoProgressionConfig>(() => {
    const saved = localStorage.getItem('wizard-auto-progression');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      fastMode: false,
      delay: 800
    };
  });

  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [shouldProgress, setShouldProgress] = useState(false);

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem('wizard-auto-progression', JSON.stringify(config));
  }, [config]);

  // Determinar se é uma categoria simples que deve auto-avançar imediatamente
  const isSimpleCategory = useCallback((type: string): boolean => {
    const normalizedType = normalizeComponentType(type);
    return [
      "datacenter",
      "contrato", 
      "processador",
      "memoria",
      "sistemaoperacional"
    ].includes(normalizedType);
  }, []);

  // Determinar se é uma categoria opcional
  const isOptionalCategory = useCallback((type: string): boolean => {
    const normalizedType = normalizeComponentType(type);
    return normalizedType === "servicospersonalizados";
  }, []);

  // Verificar se categoria complexa está pronta para avançar
  const isComplexCategoryReady = useCallback((type: string): boolean => {
    const normalizedType = normalizeComponentType(type);
    
    if (normalizedType === "armazenamento") {
      return storageItems.internal.length > 0;
    }
    
    if (normalizedType === "conectividade") {
      const hasPort = Object.values(connectivityItems).some(
        item => item.option.subtype === "porta"
      );
      const hasIp = Object.values(connectivityItems).some(
        item => item.option.subtype === "ip"
      );
      return hasPort && hasIp;
    }
    
    return false;
  }, [connectivityItems, storageItems]);

  // Iniciar countdown para progressão automática
  const startCountdown = useCallback(() => {
    if (!config.enabled) return;
    
    const delay = config.fastMode ? 500 : config.delay;
    setCountdownSeconds(Math.ceil(delay / 1000));
    setShouldProgress(true);
    
    const interval = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        onNextStep();
      }
      setShouldProgress(false);
      setCountdownSeconds(null);
    }, delay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [config, currentStep, totalSteps, onNextStep]);

  // Cancelar progressão automática
  const cancelProgression = useCallback(() => {
    setShouldProgress(false);
    setCountdownSeconds(null);
  }, []);

  // Efeito principal para gerenciar progressão automática
  useEffect(() => {
    if (!config.enabled || currentStep >= totalSteps - 1) return;

    const normalizedType = normalizeComponentType(componentType);
    
    // Categoria simples: progressão imediata após seleção
    if (isSimpleCategory(componentType) && isStepComplete(currentStep)) {
      const cleanup = startCountdown();
      return cleanup;
    }
    
    // Categoria complexa: progressão quando critérios são atendidos
    if (["armazenamento", "conectividade"].includes(normalizedType)) {
      if (isComplexCategoryReady(componentType)) {
        const cleanup = startCountdown();
        return cleanup;
      }
    }
    
    // Categoria opcional: progressão após delay sem interação
    if (isOptionalCategory(componentType)) {
      const timeout = setTimeout(() => {
        const cleanup = startCountdown();
        return cleanup;
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [
    config.enabled,
    currentStep,
    totalSteps,
    componentType,
    isStepComplete,
    isSimpleCategory,
    isComplexCategoryReady,
    isOptionalCategory,
    startCountdown
  ]);

  return {
    config,
    setConfig,
    countdownSeconds,
    shouldProgress,
    cancelProgression,
    isSimpleCategory: isSimpleCategory(componentType),
    isOptionalCategory: isOptionalCategory(componentType),
    isComplexCategoryReady: isComplexCategoryReady(componentType)
  };
}
