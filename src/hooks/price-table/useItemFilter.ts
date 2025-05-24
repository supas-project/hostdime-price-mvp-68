
import { useMemo } from 'react';
import { PriceItem } from '@/types/pricing';

export function useItemFilter(items: PriceItem[], searchTerm: string, sortOrder?: 'asc' | 'desc') {
  const filteredItems = useMemo(() => {
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
          // Ascending sort by price
          return (a.price || 0) - (b.price || 0);
        } else if (sortOrder === 'desc') {
          // Descending sort by price
          return (b.price || 0) - (a.price || 0);
        }
        return 0;
      });
    }
    
    return filteredItems;
  }, [items, searchTerm, sortOrder]);

  return filteredItems;
}
