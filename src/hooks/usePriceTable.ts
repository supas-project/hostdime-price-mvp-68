import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { systemComponentsService, SystemComponent } from '@/services/systemComponentsService';

export interface GroupedCategory {
  id: string;
  nome: string;
  items: SystemComponent[];
}

export function usePriceTable() {
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

  const categories: GroupedCategory[] = useMemo(() => {
    // ================== INÍCIO DOS LOGS DE DEPURAÇÃO ==================
    console.log('[GROUPING-DEBUG] Iniciando o agrupamento de dados...');
    
    if (!allComponents || allComponents.length === 0) {
      console.log('[GROUPING-DEBUG] `allComponents` está vazio ou nulo. Nada a agrupar.');
      return [];
    }

    // LOG PARA VER A ESTRUTURA EXATA DE UM ITEM
    console.log('[GROUPING-DEBUG] Amostra do primeiro componente recebido do banco:', allComponents[0]);
    console.log('[GROUPING-DEBUG] A chave de categoria do primeiro componente é:', allComponents[0]?.component_type);
    // =================================================================

    const grouped = allComponents.reduce((acc, component) => {
      const categoryName = component.component_type || 'outros';
      
      if (!categoryName || categoryName === 'outros') {
        console.warn('[GROUPING-DEBUG] AVISO: Componente com categoria nula ou indefinida encontrado:', component);
      }

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
    
    // ================== LOGS DE RESULTADO ==================
    console.log('[GROUPING-DEBUG] Objeto de categorias agrupadas final:', grouped);
    const result = Object.values(grouped);
    console.log('[GROUPING-DEBUG] Array de categorias final enviado para a UI:', result);
    // =======================================================

    return result;
  }, [allComponents]);

  // Ações básicas de edição
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
