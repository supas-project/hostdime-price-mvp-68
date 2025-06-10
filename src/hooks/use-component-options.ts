
import { useEffect, useState, useCallback } from "react";
import { ComponentOption } from "@/types/component";
import { memoryComponents } from "@/data/memory-components";
import { cpuComponents } from "@/data/cpu-components";
import { osComponents } from "@/data/os-components";

export function useComponentOptions(componentType: string) {
  const [options, setOptions] = useState<ComponentOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadOptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedOptions: ComponentOption[] = [];
      
      // Normalizar tipo de componente para comparação
      const normalizedType = componentType.toLowerCase();
      
      // Usar apenas dados estáticos
      switch (normalizedType) {
        case 'memory':
        case 'memória':
          fetchedOptions = memoryComponents.options;
          break;
          
        case 'cpu':
        case 'processador':
          fetchedOptions = cpuComponents.options;
          break;
          
        case 'os':
        case 'sistema_operacional':
        case 'sistemaoperacional':
          fetchedOptions = osComponents.options;
          break;
          
        default:
          console.warn(`Unknown component type: ${componentType}`);
          fetchedOptions = [];
      }
      
      console.log(`[useComponentOptions] Loaded ${fetchedOptions.length} ${componentType} options from static data`);
      setOptions(fetchedOptions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(errorMessage));
      console.error(`[useComponentOptions] Error loading ${componentType}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [componentType]);

  useEffect(() => {
    if (componentType) {
      loadOptions();
    }
  }, [componentType, loadOptions]);

  return {
    options,
    isLoading,
    error,
    refreshOptions: loadOptions
  };
}
