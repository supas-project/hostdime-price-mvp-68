
import { useState } from 'react';
import { PriceItem } from '@/types/pricing';

export function useProductComparison() {
  const [comparisonItems, setComparisonItems] = useState<PriceItem[]>([]);
  const [isComparisonMode, setIsComparisonMode] = useState(false);

  const addToComparison = (item: PriceItem) => {
    if (comparisonItems.length < 3 && !comparisonItems.find(i => i.id === item.id)) {
      setComparisonItems([...comparisonItems, item]);
    }
  };

  const removeFromComparison = (itemId: string) => {
    setComparisonItems(comparisonItems.filter(item => item.id !== itemId));
  };

  const clearComparison = () => {
    setComparisonItems([]);
  };

  const toggleComparisonMode = () => {
    setIsComparisonMode(!isComparisonMode);
    if (!isComparisonMode) {
      clearComparison();
    }
  };

  const isItemInComparison = (itemId: string) => {
    return comparisonItems.some(item => item.id === itemId);
  };

  return {
    comparisonItems,
    isComparisonMode,
    addToComparison,
    removeFromComparison,
    clearComparison,
    toggleComparisonMode,
    isItemInComparison,
    canAddMore: comparisonItems.length < 3
  };
}
