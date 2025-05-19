
import { useState } from 'react';
import { PriceData, PriceItem } from '@/types/pricing';

export function usePriceTableState() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [activeTab, setActiveTab] = useState('cpu');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [displayMode, setDisplayMode] = useState<'table' | 'card'>('card');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [contractDuration, setContractDuration] = useState<string>('12');
  const [isLoading, setIsLoading] = useState(true);

  // Toggle category collapse state
  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategories(current => ({
      ...current,
      [categoryId]: !current[categoryId]
    }));
  };

  return {
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
  };
}
