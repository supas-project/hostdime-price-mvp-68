
import { useState, useEffect } from 'react';
import { Category, Item, ChangeLog } from '@/types/database';
import { UnifiedDataService } from '@/services/unified-data-service';
import { useAuth } from '@/contexts/auth/UnifiedAuthContext';

export function useUnifiedData() {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [changeLog, setChangeLog] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [categoriesData, itemsData, changeLogData] = await Promise.all([
        UnifiedDataService.getCategories(),
        UnifiedDataService.getItems(),
        UnifiedDataService.getChangeLog(20)
      ]);
      
      setCategories(categoriesData);
      setItems(itemsData);
      setChangeLog(changeLogData);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error('Error loading unified data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Category operations
  const addCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const newCategory = await UnifiedDataService.createCategory(category);
    if (newCategory) {
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.display_order - b.display_order));
    }
    return newCategory;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const updatedCategory = await UnifiedDataService.updateCategory(id, updates);
    if (updatedCategory) {
      setCategories(prev => 
        prev.map(cat => cat.id === id ? updatedCategory : cat)
           .sort((a, b) => a.display_order - b.display_order)
      );
    }
    return updatedCategory;
  };

  const deleteCategory = async (id: string) => {
    const success = await UnifiedDataService.deleteCategory(id);
    if (success) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
      setItems(prev => prev.filter(item => item.category_id !== id));
    }
    return success;
  };

  // Item operations
  const addItem = async (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => {
    const newItem = await UnifiedDataService.createItem(item);
    if (newItem) {
      setItems(prev => [...prev, newItem].sort((a, b) => 
        a.category_id.localeCompare(b.category_id) || a.display_order - b.display_order
      ));
    }
    return newItem;
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    const updatedItem = await UnifiedDataService.updateItem(id, updates);
    if (updatedItem) {
      setItems(prev => 
        prev.map(item => item.id === id ? updatedItem : item)
           .sort((a, b) => 
             a.category_id.localeCompare(b.category_id) || a.display_order - b.display_order
           )
      );
    }
    return updatedItem;
  };

  const deleteItem = async (id: string) => {
    const success = await UnifiedDataService.deleteItem(id);
    if (success) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
    return success;
  };

  // Get items by category
  const getItemsByCategory = (categoryId: string) => {
    return items.filter(item => item.category_id === categoryId);
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!isAuthenticated) return;

    loadData();

    // Subscribe to real-time changes
    const categoriesSubscription = UnifiedDataService.subscribeToCategories((payload) => {
      console.log('Categories change:', payload);
      loadData(); // Reload data on any change
    });

    const itemsSubscription = UnifiedDataService.subscribeToItems((payload) => {
      console.log('Items change:', payload);
      loadData(); // Reload data on any change
    });

    const changeLogSubscription = UnifiedDataService.subscribeToChangeLog((payload) => {
      console.log('Change log update:', payload);
      setChangeLog(prev => [payload.new, ...prev.slice(0, 19)]);
    });

    return () => {
      categoriesSubscription.unsubscribe();
      itemsSubscription.unsubscribe();
      changeLogSubscription.unsubscribe();
    };
  }, [isAuthenticated]);

  return {
    // Data
    categories,
    items,
    changeLog,
    loading,
    error,
    
    // Category operations
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Item operations
    addItem,
    updateItem,
    deleteItem,
    getItemsByCategory,
    
    // Utilities
    loadData
  };
}
