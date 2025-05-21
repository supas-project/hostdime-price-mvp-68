
import { useState, useEffect } from 'react';
import { ComponentOption } from '@/types/component';
import { PriceService } from '@/services/price-service';
import { useDataSync } from '@/hooks/useDataSync';

/**
 * Hook para gerenciar e sincronizar as opções de processador
 */
export function useProcessor() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [processorOptions, setProcessorOptions] = useState<ComponentOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Usar o hook de sincronização de dados
  const { hasUpdates, syncWithLatestData, lastSyncTime } = useDataSync();

  // Carregar e sincronizar dados de processador
  useEffect(() => {
    async function loadProcessorData() {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("[useProcessor] Loading processor data...");
        
        // Obter dados da categoria de processador do serviço de preços
        const processorData = await PriceService.getCategory('processor');
        
        if (processorData && processorData.items && processorData.items.length > 0) {
          // Converter itens de preço para opções de componente
          const options = processorData.items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || `${item.name}`,
            price: item.price,
            type: 'Processador',
            specs: item.specs || [],
            metadata: {
              cores: item.metadata?.cores || 0,
              perCore: item.metadata?.perCore || false,
              features: item.metadata?.features || []
            }
          }));
          
          setProcessorOptions(options);
          console.log(`[useProcessor] Loaded ${options.length} processor options`);
        } else {
          console.warn("[useProcessor] No processor data found");
          setProcessorOptions([]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("[useProcessor] Error loading processor data:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setIsLoading(false);
      }
    }
    
    loadProcessorData();
    
    // Configurar um listener para atualizar os dados quando houver mudanças
    const handleDataChange = async () => {
      console.log("[useProcessor] Data change detected, reloading processor data");
      loadProcessorData();
    };
    
    // Adicionar o listener de mudanças
    PriceService.addDataChangeListener(handleDataChange);
    
    // Limpar o listener quando o componente for desmontado
    return () => {
      PriceService.removeDataChangeListener(handleDataChange);
    };
  }, []);
  
  // Função para sincronizar com os dados mais recentes
  const syncProcessorData = async () => {
    if (hasUpdates) {
      try {
        console.log("[useProcessor] Syncing with latest data");
        await syncWithLatestData();
        
        // Recarregar os dados do processador
        const processorData = await PriceService.getCategory('processor');
        
        if (processorData && processorData.items) {
          const options = processorData.items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || `${item.name}`,
            price: item.price,
            type: 'Processador',
            specs: item.specs || [],
            metadata: {
              cores: item.metadata?.cores || 0,
              perCore: item.metadata?.perCore || false,
              features: item.metadata?.features || []
            }
          }));
          
          setProcessorOptions(options);
          console.log("[useProcessor] Processor data synced successfully");
        }
      } catch (err) {
        console.error("[useProcessor] Error syncing processor data:", err);
        setError(err instanceof Error ? err.message : "Erro na sincronização");
      }
    }
  };

  return {
    isLoading,
    error,
    processorOptions,
    syncProcessorData,
    hasUpdates
  };
}
