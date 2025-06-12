import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { systemComponentsService, SystemComponent } from '@/services/systemComponentsService';

export interface GroupedCategory {
  id: string;
  nome: string;
  items: SystemComponent[];
}

export function usePriceTable() {
  const { data: allComponents, isLoading, isError } = useQuery({
    queryKey: ['systemComponents'],
    queryFn: () => systemComponentsService.getOrInitializeAllComponents(),
  });

  const categories: GroupedCategory[] = useMemo(() => {
    if (!allComponents) return [];
    
    const grouped = allComponents.reduce((acc, component) => {
      const categoryName = component.component_type; // A chave de agrupamento correta
      if (!acc[categoryName]) {
        acc[categoryName] = { id: categoryName, nome: categoryName, items: [] };
      }
      acc[categoryName].items.push(component);
      return acc;
    }, {} as Record<string, GroupedCategory>);

    return Object.values(grouped);
  }, [allComponents]);
  
  return {
    categories,
    isLoading,
    isError,
  };
}
