import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { systemComponentsService, SystemComponent } from '@/services/systemComponentsService';

// A interface para uma categoria agrupada
export interface GroupedCategory {
  id: string;
  nome: string;
  items: SystemComponent[];
}

export function usePriceTable() {
  // 1. A ÚNICA FONTE DE DADOS: useQuery com nosso serviço inteligente e automático.
  const {
    data: allComponents,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['systemComponents'],
    queryFn: () => systemComponentsService.getOrInitializeAllComponents(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });

  // 2. Transforma a lista de componentes em categorias agrupadas para a UI.
  const categories: GroupedCategory[] = useMemo(() => {
    if (!allComponents) return [];
    
    const grouped = allComponents.reduce((acc, component) => {
      const categoryName = component.component_type || 'outros';
      if (!acc[categoryName]) {
        acc[categoryName] = { 
          id: categoryName, 
          nome: categoryName, 
          items: [] 
        };
      }
      acc[categoryName].items.push(component);
      return acc;
    }, {} as Record<string, GroupedCategory>);

    return Object.values(grouped);
  }, [allComponents]);

  // 3. Reúne as ações de edição básicas
  const actions = useMemo(() => ({
    addItem: async (categoryId: string, item: Omit<SystemComponent, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        await systemComponentsService.addComponent(item);
        refetch();
      } catch (error) {
        console.error('Error adding item:', error);
        throw error;
      }
    },
    updateItem: async (itemId: string, updates: Partial<SystemComponent>) => {
      try {
        await systemComponentsService.updateComponent(itemId, updates);
        refetch();
      } catch (error) {
        console.error('Error updating item:', error);
        throw error;
      }
    },
    deleteItem: async (itemId: string) => {
      try {
        await systemComponentsService.deleteComponent(itemId);
        refetch();
      } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
      }
    }
  }), [refetch]);

  // 4. Retorna tudo o que a UI precisa, sem nenhum serviço ou lógica antiga.
  return {
    categories,
    isLoading,
    isError,
    error,
    allComponents,
    refetch,
    actions,
  };
}
