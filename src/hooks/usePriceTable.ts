import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { systemComponentsService } from '@/services/systemComponentsService';
import { useItemActions } from './price-table/item-actions/useItemActions';
import { useCategoryActions } from './price-table/category-actions/useCategoryActions';

// A interface para uma categoria agrupada
export interface GroupedCategory {
  id: string;
  nome: string;
  items: any[]; // Use 'any' por enquanto, podemos refinar o tipo depois
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

  // 3. Reúne as ações de edição (com fallback para evitar erros se os hooks não existirem)
  let itemActions = {};
  let categoryActions = {};
  
  try {
    itemActions = useItemActions?.() || {};
  } catch (error) {
    console.warn('useItemActions not available:', error);
  }
  
  try {
    categoryActions = useCategoryActions?.() || {};
  } catch (error) {
    console.warn('useCategoryActions not available:', error);
  }

  // 4. Retorna tudo o que a UI precisa, sem nenhum serviço ou lógica antiga.
  return {
    categories,
    isLoading,
    isError,
    error,
    refetch,
    allComponents,
    actions: {
      ...itemActions,
      ...categoryActions,
    },
  };
}
