
import { usePriceTableState } from './price-table/usePriceTableState';
import { useDataLoader } from './price-table/useDataLoader';
import { useItemFilter } from './price-table/useItemFilter';
import { useSyncData } from './price-table/useSyncData';
import { usePriceTableActions } from './price-table/usePriceTableActions';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export function usePriceTable() {
  const { isAuthenticated } = useAuth();
  
  // Use the specialized hooks
  const {
    priceData,
    setPriceData,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    displayMode,
    setDisplayMode,
    collapsedCategories,
    toggleCategoryCollapse,
    contractDuration,
    setContractDuration,
    isLoading,
    setIsLoading
  } = usePriceTableState();
  
  // useDataLoader takes no arguments
  const { loadPriceData } = useDataLoader();
  
  // Usar o hook de filtro de forma correta, passando os parâmetros
  const { filterItems } = useItemFilter();
  
  // Aplicar o filtro ao priceData atual
  const filteredItems = useMemo(() => {
    if (!priceData || !activeTab || !priceData[activeTab]) return [];
    return filterItems(priceData[activeTab].items || [], searchTerm, sortOrder);
  }, [priceData, activeTab, searchTerm, sortOrder, filterItems]);
  
  const { hasUpdates, handleSyncData, lastSyncTime } = useSyncData();
  const tableActions = usePriceTableActions(activeTab, setPriceData);

  return {
    isLoading,
    priceData,
    setPriceData,
    activeTab,
    setActiveTab,
    tableActions,
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
    filteredItems,
    contractDuration,
    setContractDuration,
  };
}
