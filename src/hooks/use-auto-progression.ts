
import { useState, useEffect, useCallback, useRef } from "react";
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
      delay: 1500
    };
  });

  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [shouldProgress, setShouldProgress] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem('wizard-auto-progression', JSON.stringify(config));
  }, [config]);

  // Limpar timeouts ao desmontar o componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Determinar se é uma categoria simples que deve auto-avançar imediatamente
  const isSimpleCategory = useCallback((type: string): boolean => {
    const normalizedType = normalizeComponentType(type);
    console.log(`[isSimpleCategory] Verificando tipo: ${type}, normalizado: ${normalizedType}`);
    
    const simpleCategories = [
      "datacenter",
      "contrato", 
      "processador",
      "memoria",
      "sistemaoperacional"
    ];
    
    const isSimple = simpleCategories.includes(normalizedType);
    console.log(`[isSimpleCategory] ${normalizedType} é simples: ${isSimple}`);
    return isSimple;
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
      const ready = storageItems.internal.length > 0;
      console.log(`[isComplexCategoryReady] Armazenamento pronto: ${ready}, discos internos: ${storageItems.internal.length}`);
      return ready;
    }
    
    if (normalizedType === "conectividade") {
      const hasPort = Object.values(connectivityItems).some(
        item => item.option.subtype === "porta"
      );
      const hasIp = Object.values(connectivityItems).some(
        item => item.option.subtype === "ip"
      );
      const ready = hasPort && hasIp;
      console.log(`[isComplexCategoryReady] Conectividade pronto: ${ready}, porta: ${hasPort}, IP: ${hasIp}`);
      return ready;
    }
    
    return false;
  }, [connectivityItems, storageItems]);

  // Cancelar progressão automática
  const cancelProgression = useCallback(() => {
    console.log("[cancelProgression] Cancelando progressão automática");
    setShouldProgress(false);
    setCountdownSeconds(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Iniciar countdown para progressão automática
  const startCountdown = useCallback(() => {
    if (!config.enabled) {
      console.log("[startCountdown] Progressão automática desabilitada");
      return;
    }
    
    console.log("[startCountdown] Iniciando countdown para progressão automática");
    
    const delay = config.fastMode ? 800 : config.delay;
    const countdownTime = Math.ceil(delay / 1000);
    
    setCountdownSeconds(countdownTime);
    setShouldProgress(true);
    
    // Limpar timeouts anteriores
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Countdown visual
    intervalRef.current = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    // Timeout para progressão
    timeoutRef.current = setTimeout(() => {
      console.log("[startCountdown] Executando progressão automática");
      if (currentStep < totalSteps - 1) {
        onNextStep();
      }
      setShouldProgress(false);
      setCountdownSeconds(null);
      timeoutRef.current = null;
    }, delay);
  }, [config, currentStep, totalSteps, onNextStep]);

  // Efeito principal para gerenciar progressão automática
  useEffect(() => {
    console.log(`[useAutoProgression] Efeito executado - step: ${currentStep}, type: ${componentType}, enabled: ${config.enabled}`);
    
    if (!config.enabled || currentStep >= totalSteps - 1) {
      console.log("[useAutoProgression] Progressão desabilitada ou último passo");
      return;
    }

    const normalizedType = normalizeComponentType(componentType);
    console.log(`[useAutoProgression] Tipo normalizado: ${normalizedType}`);
    
    // Categoria simples: progressão imediata após seleção
    if (isSimpleCategory(componentType)) {
      const stepComplete = isStepComplete(currentStep);
      console.log(`[useAutoProgression] Categoria simples - step complete: ${stepComplete}`);
      
      if (stepComplete) {
        console.log("[useAutoProgression] Iniciando progressão para categoria simples");
        startCountdown();
      }
      return;
    }
    
    // Categoria complexa: progressão quando critérios são atendidos
    if (["armazenamento", "conectividade"].includes(normalizedType)) {
      if (isComplexCategoryReady(componentType)) {
        console.log("[useAutoProgression] Iniciando progressão para categoria complexa");
        startCountdown();
      }
      return;
    }
    
    // Categoria opcional: progressão após delay sem interação
    if (isOptionalCategory(componentType)) {
      console.log("[useAutoProgression] Iniciando progressão para categoria opcional");
      const optionalTimeout = setTimeout(() => {
        startCountdown();
      }, 3000);
      
      return () => clearTimeout(optionalTimeout);
    }
  }, [
    config.enabled,
    currentStep,
    totalSteps,
    componentType,
    selectedComponents,
    connectivityItems,
    storageItems,
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
