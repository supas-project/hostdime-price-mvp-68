
import { useState, useMemo } from 'react';
import { ComponentOption } from '@/types/component';
import { FilterCriteria } from '@/components/filters/IntelligentFilters';

export function useIntelligentFilters(items: ComponentOption[]) {
  const [filteredItems, setFilteredItems] = useState<ComponentOption[]>(items);
  const [currentFilters, setCurrentFilters] = useState<FilterCriteria | null>(null);

  const handleFilterChange = (filtered: ComponentOption[], criteria: FilterCriteria) => {
    setFilteredItems(filtered);
    setCurrentFilters(criteria);
  };

  const filterStats = useMemo(() => {
    const total = items.length;
    const filtered = filteredItems.length;
    const percentage = total > 0 ? Math.round((filtered / total) * 100) : 0;
    
    return {
      total,
      filtered,
      percentage,
      hasFilters: currentFilters && (
        currentFilters.search ||
        currentFilters.category.length > 0 ||
        currentFilters.features.length > 0 ||
        currentFilters.availability !== 'all'
      )
    };
  }, [items.length, filteredItems.length, currentFilters]);

  return {
    filteredItems,
    currentFilters,
    filterStats,
    handleFilterChange
  };
}
