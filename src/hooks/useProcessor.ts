
import { useState, useEffect } from 'react';
import { ComponentOption } from '@/types/component';
import { convertProcessorPriceDataToComponents } from '@/services/component-sync/processor-converter';

/**
 * Hook para gerenciar e sincronizar as opções de processador
 */
export function useProcessor() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [processorOptions, setProcessorOptions] = useState<ComponentOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Carregar e sincronizar dados de processador
  useEffect(() => {
    async function loadProcessorData() {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("[useProcessor] Loading processor data...");
        
        // Usar a função de conversão para obter dados sincronizados
        const options = await convertProcessorPriceDataToComponents();
        
        // Configurar opções
        setProcessorOptions(options);
        
        console.log(`[useProcessor] Loaded ${options.length} processor options`);
        
        setIsLoading(false);
      } catch (err) {
        console.error("[useProcessor] Error loading processor data:", err);
        setError("Erro ao carregar opções de processador");
        setIsLoading(false);
      }
    }
    
    loadProcessorData();
  }, []);

  return {
    isLoading,
    error,
    processorOptions
  };
}
