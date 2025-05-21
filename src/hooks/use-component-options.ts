
import { useState, useEffect, useCallback } from "react";
import { ComponentOption } from "@/types/component";
import { cpuComponents } from "@/data/cpu-components";
import { memoryComponents } from "@/data/memory-components";
import { osComponents } from "@/data/os-components";
import { dataCenterComponents } from "@/data/datacenter-components";
import { convertProcessorItems } from "@/services/component-sync/processor-converter";
import { PriceService } from "@/services/price-service";

/**
 * Hook to get component options based on component type
 */
export function useComponentOptions(componentType: string) {
  const [options, setOptions] = useState<ComponentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch component options
  const fetchOptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let componentOptions: ComponentOption[] = [];
      
      switch (componentType.toLowerCase()) {
        case 'cpu':
        case 'processor':
          // Get processor options from price service
          componentOptions = await convertProcessorItems();
          break;
          
        case 'memory':
          // Use memory components
          componentOptions = memoryComponents.options;
          break;
          
        case 'os':
        case 'sistemaoperacional':
          // Use OS components
          componentOptions = osComponents.options;
          break;
          
        case 'datacenter':
          // Use data center components
          componentOptions = dataCenterComponents.options;
          break;
          
        default:
          console.warn(`Unknown component type: ${componentType}`);
          componentOptions = [];
      }
      
      setOptions(componentOptions);
    } catch (err) {
      console.error(`Error fetching ${componentType} options:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [componentType]);

  // Initial fetch
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // Refetch function for manual updates
  const refetch = useCallback(() => {
    return fetchOptions();
  }, [fetchOptions]);

  return {
    options,
    isLoading,
    error,
    refetch
  };
}
