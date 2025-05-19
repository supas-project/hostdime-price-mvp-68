
import { useState, useEffect } from 'react';
import { PriceService } from '@/services/price-service';
import { PriceData, PriceItem } from '@/types/pricing';
import { usePriceTableActions } from './price-table/usePriceTableActions';
import { useDataSync } from './useDataSync';
import { toast } from 'sonner';

export function usePriceTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [activeTab, setActiveTab] = useState('cpu');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [displayMode, setDisplayMode] = useState<'table' | 'card'>('card');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [contractDuration, setContractDuration] = useState<string>('12');
  
  const { hasUpdates, syncWithLatestData, lastSyncTime } = useDataSync();

  // Filter function for items based on search term
  const filterItems = (items: PriceItem[]): PriceItem[] => {
    if (!searchTerm || searchTerm.trim() === '') return items;
    const lowerTerm = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerTerm) ||
      item.description?.toLowerCase().includes(lowerTerm) ||
      item.specs?.some((spec: string) => spec.toLowerCase().includes(lowerTerm))
    );
  };

  // Toggle category collapse state
  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategories(current => ({
      ...current,
      [categoryId]: !current[categoryId]
    }));
  };

  // Load price data
  const loadPriceData = async () => {
    setIsLoading(true);
    try {
      const data = await PriceService.getAllData();
      setPriceData(data);
    } catch (error) {
      console.error('Error loading price data:', error);
      toast.error("Erro ao carregar dados de preço. Tente novamente mais tarde.");
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

  // Function to sync with latest data when updates are available
  const handleSyncData = async () => {
    if (hasUpdates) {
      await syncWithLatestData();
      await loadPriceData();
      toast.success("Dados atualizados com sucesso!");
    }
  };

  return {
    isLoading,
    priceData,
    setPriceData,
    activeTab,
    setActiveTab,
    hasUpdates,
    handleSyncData,
    loadPriceData,
    lastSyncTime,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    displayMode,
    setDisplayMode,
    collapsedCategories,
    toggleCategoryCollapse,
    filterItems,
    contractDuration,
    setContractDuration,
  };
}
