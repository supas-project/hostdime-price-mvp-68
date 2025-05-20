
import { useState, useEffect } from 'react';
import { ComponentOption } from '@/types/component';
import { PriceService } from '@/services/price-service';
import { convertConnectivityPriceDataToComponents } from '@/services/component-sync';

/**
 * Hook para gerenciar e sincronizar as opções de conectividade
 */
export function useConnectivity() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectivityOptions, setConnectivityOptions] = useState<ComponentOption[]>([]);
  const [portOptions, setPortOptions] = useState<ComponentOption[]>([]);
  const [ipOptions, setIpOptions] = useState<ComponentOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Carregar e sincronizar dados de conectividade
  useEffect(() => {
    async function loadConnectivityData() {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("[useConnectivity] Loading connectivity data...");
        
        // Usar a função de conversão para obter dados sincronizados
        const { portOptions: ports, ipOptions: ips } = await convertConnectivityPriceDataToComponents();
        
        // Configurar opções por tipo
        setPortOptions(ports);
        setIpOptions(ips);
        
        // Combinar todas as opções
        const allOptions = [...ports, ...ips];
        setConnectivityOptions(allOptions);
        
        console.log(`[useConnectivity] Loaded ${ports.length} port options and ${ips.length} IP options`);
        
        setIsLoading(false);
      } catch (err) {
        console.error("[useConnectivity] Error loading connectivity data:", err);
        setError("Erro ao carregar opções de conectividade");
        setIsLoading(false);
      }
    }
    
    loadConnectivityData();
  }, []);

  return {
    isLoading,
    error,
    connectivityOptions,
    portOptions,
    ipOptions
  };
}
