
import { useState, useEffect, useCallback } from 'react';
import { PriceService } from '@/services/price-service';
import { PriceData, PriceCategory } from '@/types/pricing';
import { toast } from '@/utils/toast-utils';

interface UseDataLoaderOptions {
  autoLoad?: boolean;
  showToasts?: boolean;
}

export interface UseDataLoaderReturn {
  data: PriceData | null;
  categories: string[];
  isLoading: boolean;
  error: Error | null;
  loadData: () => Promise<void>;
  refreshData: () => Promise<void>;
  resetData: () => Promise<void>;
}

export function useDataLoader(options: UseDataLoaderOptions = {}): UseDataLoaderReturn {
  const { autoLoad = true, showToasts = true } = options;
  
  const [data, setData] = useState<PriceData | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const priceData = await PriceService.getAllData();
      
      if (priceData) {
        setData(priceData);
        setCategories(Object.keys(priceData));
        if (showToasts) {
          toast.success('Dados carregados com sucesso');
        }
      } else {
        throw new Error('Não foi possível carregar os dados de preços');
      }
    } catch (err) {
      console.error('Error loading price data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      if (showToasts) {
        toast.error('Erro ao carregar dados');
      }
    } finally {
      setIsLoading(false);
    }
  }, [showToasts]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call forceRefreshFromLatestSource with no arguments as expected in the service
      await PriceService.forceRefreshFromLatestSource();
      
      const priceData = await PriceService.getAllData();
      
      if (priceData) {
        setData(priceData);
        setCategories(Object.keys(priceData));
        if (showToasts) {
          toast.success('Dados atualizados com sucesso');
        }
      } else {
        throw new Error('Não foi possível atualizar os dados de preços');
      }
    } catch (err) {
      console.error('Error refreshing price data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      if (showToasts) {
        toast.error('Erro ao atualizar dados');
      }
    } finally {
      setIsLoading(false);
    }
  }, [showToasts]);

  const resetData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await PriceService.resetData();
      const priceData = await PriceService.getAllData();
      
      if (priceData) {
        setData(priceData);
        setCategories(Object.keys(priceData));
        if (showToasts) {
          toast.success('Dados redefinidos com sucesso');
        }
      } else {
        throw new Error('Não foi possível redefinir os dados de preços');
      }
    } catch (err) {
      console.error('Error resetting price data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      if (showToasts) {
        toast.error('Erro ao redefinir dados');
      }
    } finally {
      setIsLoading(false);
    }
  }, [showToasts]);

  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  return {
    data,
    categories,
    isLoading,
    error,
    loadData,
    refreshData,
    resetData
  };
}
