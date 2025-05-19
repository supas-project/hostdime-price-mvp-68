
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
  
  // Get the data loader hook with all its loading functionality
  const { loadData, refreshData, resetData } = useDataLoader({
    autoLoad: false, // We'll handle loading manually
    showToasts: true
  });
  
  const { filterItems } = useItemFilter();
  const { hasUpdates, handleSyncData, lastSyncTime } = useSyncData(loadData);
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
    loadPriceData: loadData, // Rename loadData to loadPriceData for consistent naming
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
