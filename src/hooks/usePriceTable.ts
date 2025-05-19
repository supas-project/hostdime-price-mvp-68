
import { useState, useEffect } from 'react';
import { PriceService } from '@/services/price-service';
import { PriceData } from '@/types/pricing';
import { usePriceTableActions } from './price-table/usePriceTableActions';
import { useDataSync } from './useDataSync';
import { toast } from 'sonner';

export function usePriceTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [activeTab, setActiveTab] = useState('cpu');
  const { hasUpdates, syncWithLatestData } = useDataSync();

  // Load price data
  const loadPriceData = async () => {
    setIsLoading(true);
    try {
      const data = await PriceService.getAllData();
      setPriceData(data);
    } catch (error) {
      console.error('Error loading price data:', error);
      toast({
        description: 'Erro ao carregar dados de preço. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    loadPriceData();

    // Add listener for data changes
    PriceService.addDataChangeListener((newData) => {
      console.log('Price data updated:', newData);
      setPriceData(newData);
    });

    // Cleanup
    return () => {
      // Remove listener when unmounted
      PriceService.removeDataChangeListener((newData) => {
        setPriceData(newData);
      });
    };
  }, []);

  // Get table actions
  const tableActions = usePriceTableActions(activeTab, setPriceData);

  // Function to sync with latest data when updates are available
  const handleSyncData = async () => {
    if (hasUpdates) {
      await syncWithLatestData();
      await loadPriceData();
      toast({
        description: 'Dados atualizados com sucesso!'
      });
    }
  };

  return {
    isLoading,
    priceData,
    activeTab,
    setActiveTab,
    tableActions,
    hasUpdates,
    handleSyncData,
    loadPriceData,
  };
}
