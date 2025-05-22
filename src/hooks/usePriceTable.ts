
import { usePriceTableState } from './price-table/usePriceTableState';
import { useDataLoader } from './price-table/useDataLoader';
import { useItemFilter } from './price-table/useItemFilter';
import { useSyncData } from './price-table/useSyncData';
import { usePriceTableActions } from './price-table/usePriceTableActions';
import { useAuth } from '@/contexts/AuthContext';

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
  
  const { loadPriceData } = useDataLoader(isLoading, setIsLoading, setPriceData, isAuthenticated);
  const { filterItems } = useItemFilter(searchTerm, sortOrder);
  const { hasUpdates, handleSyncData, lastSyncTime } = useSyncData(loadPriceData);
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
    contractDuration,
    setContractDuration,
  };
}
