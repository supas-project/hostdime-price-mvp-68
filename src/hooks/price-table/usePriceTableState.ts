import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

export interface PriceItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  specifications?: string[];
}

export interface GroupedCategory {
  id: string;
  name: string;
  display_name: string;
  items: PriceItem[];
}

export function usePriceTableState() {
  const { items, categories, status, fetchInitialData } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      fetchInitialData();
    }
  }, [status, fetchInitialData]);

  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  // Agrupar itens por categoria
  const groupedCategories: GroupedCategory[] = categories.map(categoryName => {
    const categoryItems = items.filter(item => item.category === categoryName);
    
    return {
      id: categoryName.toLowerCase().replace(/\s+/g, '-'),
      name: categoryName,
      display_name: categoryName,
      items: categoryItems
    };
  });

  // Filtrar por busca
  const filteredCategories = groupedCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.items.length > 0);

  return {
    groupedCategories: filteredCategories,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    status,
    isLoading: status === 'loading'
  };
}