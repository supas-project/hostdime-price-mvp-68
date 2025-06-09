
import { usePriceTableState } from './price-table/usePriceTableState';
import { useDataLoader } from './price-table/useDataLoader';
import { useItemFilter } from './price-table/useItemFilter';
import { useSyncData } from './price-table/useSyncData';
import { usePriceTableActions } from './price-table/usePriceTableActions';
import { useAuth } from '@/hooks/auth';
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
  
  // Criar uma função de filtro que será usada pelos componentes
  const filterItems = (items: any[], searchTerm: string, sortOrder?: 'asc' | 'desc') => {
    if (!items || !Array.isArray(items)) return [];
    
    // Filter by search term
    let filteredItems = items;
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filteredItems = items.filter(item => {
        return (
          (item.name && item.name.toLowerCase().includes(searchLower)) ||
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          (item.specs && Array.isArray(item.specs) && item.specs.some(spec => spec.toLowerCase().includes(searchLower))) ||
          (item.tags && Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      });
    }
    
    // Sort items
    if (sortOrder) {
      filteredItems = [...filteredItems].sort((a, b) => {
        if (sortOrder === 'asc') {
          return (a.price || 0) - (b.price || 0);
        } else if (sortOrder === 'desc') {
          return (b.price || 0) - (a.price || 0);
        }
        return 0;
      });
    }
    
    return filteredItems;
  };
  
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
    contractDuration,
    setContractDuration,
  };
}
