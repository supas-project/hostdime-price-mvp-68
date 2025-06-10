
import { useState, useEffect } from 'react';
import { UnifiedDataService } from '@/services/unified-data-service';
import { Category, Item, ChangeLog } from '@/types/database';
import { toast } from '@/utils/toast-utils';

// Legacy interfaces for backward compatibility
interface UnifiedComponent {
  id: string;
  component_type: string;
  component_id: string;
  name: string;
  description?: string;
  price: number;
  subtype?: string;
  is_hardware: boolean;
  is_active: boolean;
  specs?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface UnifiedStorageItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  storage_type: string;
  item_type: string;
  capacity_gb?: number;
  specs: any[];
  metadata: Record<string, any>;
}

interface ConsolidationStatus {
  phase: 'pending' | 'consolidating' | 'completed' | 'error';
  components_count: number;
  datacenters_count: number;
  contracts_count: number;
  storage_count: number;
  errors: string[];
}

export function useUnifiedData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [changeLog, setChangeLog] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Legacy compatibility properties
  const [cpuComponents] = useState<UnifiedComponent[]>([]);
  const [memoryComponents] = useState<UnifiedComponent[]>([]);
  const [osComponents] = useState<UnifiedComponent[]>([]);
  const [connectivityComponents] = useState<UnifiedComponent[]>([]);
  const [storageItems] = useState<UnifiedStorageItem[]>([]);
  const [consolidationStatus] = useState<ConsolidationStatus>({
    phase: 'completed',
    components_count: 0,
    datacenters_count: 0,
    contracts_count: 0,
    storage_count: 0,
    errors: []
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [categoriesData, itemsData, changeLogData] = await Promise.all([
        UnifiedDataService.getCategories(),
        UnifiedDataService.getItems(),
        UnifiedDataService.getChangeLog()
      ]);
      
      setCategories(categoriesData);
      setItems(itemsData);
      setChangeLog(changeLogData);
    } catch (err) {
      console.error('Error loading unified data:', err);
      setError('Erro ao carregar dados');
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await UnifiedDataService.createCategory(categoryData);
    if (result) {
      await loadData();
    }
    return result;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const result = await UnifiedDataService.updateCategory(id, updates);
    if (result) {
      await loadData();
    }
    return result;
  };

  const deleteCategory = async (id: string) => {
    const result = await UnifiedDataService.deleteCategory(id);
    if (result) {
      await loadData();
    }
    return result;
  };

  const addItem = async (itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await UnifiedDataService.createItem(itemData);
    if (result) {
      await loadData();
    }
    return result;
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    const result = await UnifiedDataService.updateItem(id, updates);
    if (result) {
      await loadData();
    }
    return result;
  };

  const deleteItem = async (id: string) => {
    const result = await UnifiedDataService.deleteItem(id);
    if (result) {
      await loadData();
    }
    return result;
  };

  // Legacy compatibility methods (no-op)
  const loadComponentsByType = async (type: string) => {
    console.log(`Legacy method loadComponentsByType called with type: ${type}`);
  };

  const loadAllData = async () => {
    await loadData();
  };

  const consolidateData = async () => {
    console.log('Legacy consolidateData method called');
    return true;
  };

  const loadConsolidationStatus = async () => {
    console.log('Legacy loadConsolidationStatus method called');
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    categories,
    items,
    changeLog,
    loading,
    error,
    // Legacy compatibility
    cpuComponents,
    memoryComponents,
    osComponents,
    connectivityComponents,
    storageItems,
    consolidationStatus,
    // Methods
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem,
    loadData,
    // Legacy methods
    loadComponentsByType,
    loadAllData,
    consolidateData,
    loadConsolidationStatus
  };
}
