
import { useState, useCallback } from 'react';
import { PriceService } from '@/services/price-service';
import { InitService } from '@/services/init-service';
import { toast } from '@/utils/toast-utils';
import { useAuth } from '@/contexts/auth/UnifiedAuthContext';

export function useDataLoader() {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const loadPriceData = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("DataLoader: User not authenticated, skipping data load");
      return null;
    }
    
    setIsLoading(true);
    try {
      console.log("DataLoader: Attempting to load all price data");
      
      // Forçar refresh dos dados do banco
      const data = await PriceService.forceRefreshFromLatestSource();
      
      if (!data || Object.keys(data).length === 0) {
        console.log("DataLoader: No data from force refresh, trying regular getAllData");
        const fallbackData = await PriceService.getAllData();
        console.log("DataLoader: Fallback data loaded successfully");
        return fallbackData;
      }
      
      console.log("DataLoader: Fresh data loaded successfully");
      return data;
    } catch (error) {
      console.error("DataLoader: Error loading price data:", error);
      toast.error("Erro ao carregar tabela", {
        description: "Por favor, tente novamente ou contate o suporte."
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  return {
    loadPriceData,
    isLoading
  };
}
