
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
  onStepComplete: (stepIndex: number, complete: boolean) => void;
}

export function useAutoProgression({
  currentStep,
  totalSteps,
  selectedComponents,
  connectivityItems,
  storageItems,
  onNextStep,
  componentType,
  isStepComplete,
  onStepComplete
}: UseAutoProgressionProps) {
  const [config, setConfig] = useState<AutoProgressionConfig>(() => {
    const saved = localStorage.getItem('wizard-auto-progression');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      fastMode: false,
      delay: 2000
    };
  });

  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [shouldProgress, setShouldProgress] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStepRef = useRef<number>(-1);
  const lastComponentStateRef = useRef<string>("");

  // Salvar configurações
  useEffect(() => {
    localStorage.setItem('wizard-auto-progression', JSON.stringify(config));
  }, [config]);

  // Limpar timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Categorias que avançam automaticamente após seleção
  const isSimpleCategory = useCallback((type: string): boolean => {
    const normalizedType = normalizeComponentType(type);
    return ["datacenter", "contrato", "processador", "memoria", "sistemaoperacional"].includes(normalizedType);
  }, []);

  // Categorias opcionais (podem ser puladas)
  const isOptionalCategory = useCallback((type: string): boolean => {
    const normalizedType = normalizeComponentType(type);
    return normalizedType === "servicospersonalizados";
  }, []);

  // Verificar se categoria complexa tem requisitos mínimos
  const hasComplexCategoryMinimums = useCallback((type: string): boolean => {
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

  // Cancelar progressão
  const cancelProgression = useCallback(() => {
    console.log("[AutoProgression] Cancelando progressão automática");
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

  // Verificar se o step atual está completo
  const checkCurrentStepComplete = useCallback((): boolean => {
    const normalizedType = normalizeComponentType(componentType);
    
    console.log(`[AutoProgression] Verificando completude do step ${currentStep}, tipo: ${normalizedType}`);
    
    // Para categorias simples, verificar se há seleção
    if (isSimpleCategory(componentType)) {
      const hasSelection = Object.keys(selectedComponents).some(key => {
        const keyNormalized = normalizeComponentType(key);
        return keyNormalized === normalizedType;
      });
      console.log(`[AutoProgression] Categoria simples '${normalizedType}' completa: ${hasSelection}`);
      return hasSelection;
    }

    // Para categorias complexas, verificar requisitos mínimos
    if (["armazenamento", "conectividade"].includes(normalizedType)) {
      const isComplete = hasComplexCategoryMinimums(componentType);
      console.log(`[AutoProgression] Categoria complexa '${normalizedType}' completa: ${isComplete}`);
      return isComplete;
    }

    // Para outras categorias, usar a função padrão
    return isStepComplete(currentStep);
  }, [componentType, currentStep, selectedComponents, isStepComplete, isSimpleCategory, hasComplexCategoryMinimums]);

  // Iniciar countdown
  const startCountdown = useCallback(() => {
    if (!config.enabled) {
      console.log("[AutoProgression] Progressão desabilitada");
      return;
    }
    
    if (currentStep >= totalSteps - 1) {
      console.log("[AutoProgression] Último step, não avançar");
      return;
    }

    console.log("[AutoProgression] Iniciando countdown");
    
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
      console.log("[AutoProgression] Executando progressão automática");
      
      // Marcar step atual como completo antes de avançar
      onStepComplete(currentStep, true);
      
      // Avançar para próximo step
      onNextStep();
      
      // Limpar estados
      setShouldProgress(false);
      setCountdownSeconds(null);
      timeoutRef.current = null;
    }, delay);
  }, [config, currentStep, totalSteps, onNextStep, onStepComplete]);

  // Efeito principal para gerenciar auto-progressão
  useEffect(() => {
    if (!config.enabled) return;

    // Criar hash do estado atual para detectar mudanças
    const currentStateHash = JSON.stringify({
      step: currentStep,
      components: selectedComponents,
      connectivity: Object.keys(connectivityItems).length,
      storage: storageItems.internal.length + storageItems.external.length
    });

    // Se mudou de step, cancelar progressão anterior
    if (lastStepRef.current !== currentStep) {
      console.log(`[AutoProgression] Mudança de step: ${lastStepRef.current} -> ${currentStep}`);
      cancelProgression();
      lastStepRef.current = currentStep;
      lastComponentStateRef.current = currentStateHash;
      return;
    }

    // Se o estado dos componentes mudou
    if (lastComponentStateRef.current !== currentStateHash) {
      console.log("[AutoProgression] Estado dos componentes mudou");
      lastComponentStateRef.current = currentStateHash;
      
      // Cancelar progressão anterior
      cancelProgression();
      
      // Verificar se o step está completo
      const stepComplete = checkCurrentStepComplete();
      
      if (stepComplete) {
        // Marcar step como completo
        onStepComplete(currentStep, true);
        
        const normalizedType = normalizeComponentType(componentType);
        
        // Para categorias simples, iniciar progressão imediatamente
        if (isSimpleCategory(componentType)) {
          console.log("[AutoProgression] Categoria simples completa, iniciando progressão");
          startCountdown();
        }
        // Para categorias complexas, NÃO avançar automaticamente
        // Apenas marcar como completo para permitir avanço manual
        else if (["armazenamento", "conectividade"].includes(normalizedType)) {
          console.log("[AutoProgression] Categoria complexa completa, aguardando avanço manual");
        }
      } else {
        // Marcar step como incompleto
        onStepComplete(currentStep, false);
      }
    }

    // Para categoria opcional, iniciar timer após 5 segundos sem interação
    const normalizedType = normalizeComponentType(componentType);
    if (isOptionalCategory(componentType) && !shouldProgress) {
      const optionalTimer = setTimeout(() => {
        console.log("[AutoProgression] Categoria opcional, iniciando progressão após timeout");
        onStepComplete(currentStep, true);
        startCountdown();
      }, 5000);
      
      return () => clearTimeout(optionalTimer);
    }
  }, [
    config.enabled,
    currentStep,
    componentType,
    selectedComponents,
    connectivityItems,
    storageItems,
    shouldProgress,
    checkCurrentStepComplete,
    isSimpleCategory,
    isOptionalCategory,
    startCountdown,
    cancelProgression,
    onStepComplete
  ]);

  return {
    config,
    setConfig,
    countdownSeconds,
    shouldProgress,
    cancelProgression,
    isSimpleCategory: isSimpleCategory(componentType),
    isOptionalCategory: isOptionalCategory(componentType),
    isComplexCategoryReady: hasComplexCategoryMinimums(componentType)
  };
}
