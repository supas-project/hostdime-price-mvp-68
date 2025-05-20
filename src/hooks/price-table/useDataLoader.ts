
import { useEffect } from 'react';
import { PriceService } from '@/services/price-service';
import { toast } from 'sonner';
import { initializeServerCategories } from '@/services/component-sync/initialization';

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

      console.log("Carregando dados de preço para usuário autenticado");
      // Sempre buscar dados atualizados do banco de dados
      const data = await PriceService.getAllData();
      
      if (!data) {
        console.warn("Nenhum dado de preço retornado do serviço");
        setIsLoading(false);
        return;
      }
      
      console.log("Dados de preço carregados com sucesso com categorias:", Object.keys(data).join(", "));
      setPriceData(data);
      
      // After loading price data, ensure server categories are initialized
      // This ensures that the wizard components are properly synchronized
      try {
        console.log("Inicializando categorias de servidor a partir dos dados de preço");
        await initializeServerCategories();
        console.log("Categorias de servidor inicializadas com sucesso");
      } catch (initError) {
        console.error("Erro ao inicializar categorias de servidor:", initError);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de preço:', error);
      toast.error("Erro ao carregar dados de preço", {
        description: "Por favor, tente novamente ou verifique se você está autenticado."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Usuário autenticado, carregando dados de preço iniciais");
      // Limpar qualquer estado em cache antes de carregar dados novos
      setPriceData(null);
      loadPriceData();
  
      // Adicionar listener para mudanças de dados
      const listener = () => {
        console.log('Dados de preço atualizados, recarregando dados...');
        loadPriceData();
      };
      
      PriceService.addDataChangeListener(listener);
      
      // Cleanup
      return () => {
        // Remover listener ao desmontar
        PriceService.removeDataChangeListener();
      };
    } else {
      setPriceData(null);
      console.log("Usuário não autenticado, limpando dados de preço");
    }
  }, [isAuthenticated, setPriceData]);

  return {
    loadPriceData
  };
}
