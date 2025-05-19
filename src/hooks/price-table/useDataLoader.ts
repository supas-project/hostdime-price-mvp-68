
import { useEffect } from 'react';
import { PriceService } from '@/services/price-service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useDataLoader(
  isLoading: boolean,
  setIsLoading: (loading: boolean) => void, 
  setPriceData: (data: any) => void,
  isAuthenticated: boolean
) {
  // Load price data
  const loadPriceData = async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated) {
        console.log("Usuário não autenticado, não carregando dados de preço");
        setIsLoading(false);
        return;
      }

      const data = await PriceService.getAllData();
      setPriceData(data);
    } catch (error) {
      console.error('Error loading price data:', error);
      toast.error("Erro ao carregar dados de preço", {
        description: "Tente novamente mais tarde ou verifique se você está autenticado."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (isAuthenticated) {
      loadPriceData();
  
      // Add listener for data changes
      PriceService.addDataChangeListener((newData) => {
        console.log('Price data updated:', newData);
        setPriceData(newData);
      });
    } else {
      setPriceData(null);
    }
    
    // Cleanup
    return () => {
      // Remove listener when unmounted
      PriceService.removeDataChangeListener((newData) => {
        setPriceData(newData);
      });
    };
  }, [isAuthenticated, setPriceData]);

  return {
    loadPriceData
  };
}
