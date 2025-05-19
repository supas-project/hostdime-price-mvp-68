
import { PriceItem } from '@/types/pricing';

export function useItemFilter() {
  // Filter function for items based on search term
  const filterItems = (items: PriceItem[], searchTerm: string): PriceItem[] => {
    if (!searchTerm || searchTerm.trim() === '') return items;
    const lowerTerm = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerTerm) ||
      item.description?.toLowerCase().includes(lowerTerm) ||
      item.specs?.some((spec: string) => spec.toLowerCase().includes(lowerTerm))
    );
  };

  return {
    filterItems
  };
}
