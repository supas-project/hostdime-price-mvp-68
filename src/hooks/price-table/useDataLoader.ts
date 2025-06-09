
import { useState, useCallback } from 'react';
import { PriceService } from '@/services/price-service';
import { InitService } from '@/services/init-service';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/auth';

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
      const data = await PriceService.getAllData();
      console.log("DataLoader: Price data loaded successfully");
      return data;
    } catch (error) {
      console.error("DataLoader: Error loading price data:", error);
      toast.error("Erro ao carregar tabela", {
        description: "Por favor, tente novamente ou contate o suporte.",
        icon: <AlertCircle className="h-5 w-5" />
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
