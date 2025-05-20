
import { useState, useEffect, useCallback } from "react";
import { ComponentOption } from "@/types/component";
import { PriceService } from "@/services/price-service";
import { findMatchingComponent } from "@/utils/component-matching";
import { toast } from "sonner";

// Esta função mapeia os nomes de categoria amigáveis para os IDs usados no PriceService
function mapCategoryNameToId(categoryName: string): string {
  // Normalizar para minúsculas e remover espaços
  const normalized = categoryName.toLowerCase().replace(/\s+/g, '');
  
  switch (normalized) {
    case 'datacenter':
      return 'datacenter';
    case 'contrato':
    case 'duracaodocontrato':
      return 'contract';
    case 'processador':
      return 'cpu';
    case 'memoria':
    case 'memoriaram':
      return 'memory';
    case 'armazenamento':
      return 'storage';
    case 'conectividade':
    case 'opcoesdeconectividade':
      return 'connectivity';
    case 'sistemaoperacional':
      return 'os';
    case 'servicosadicionals':
    case 'servicospersonalizados':
      return 'services';
    case 'discos':
      return 'disks';
    case 'storageexterno':
      return 'external_storage';
    default:
      console.warn(`[useComponentOptions] No mapping found for category: ${categoryName}`);
      return categoryName.toLowerCase();
  }
}

export function useComponentOptions(categoryId: string, selectedOption?: ComponentOption | null) {
  const [options, setOptions] = useState<ComponentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [matchedSelectedOption, setMatchedSelectedOption] = useState<ComponentOption | null>(null);

  const loadOptions = useCallback(async () => {
    if (!categoryId) {
      setOptions([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Mapear o ID da categoria para o formato esperado pelo PriceService
      const mappedCategoryId = mapCategoryNameToId(categoryId);
      console.log(`[useComponentOptions] Loading options for category '${categoryId}' (mapped to '${mappedCategoryId}')`);
      
      // Get category data from price service
      const category = await PriceService.getCategory(mappedCategoryId);
      
      if (category && Array.isArray(category.items) && category.items.length > 0) {
        // Convert price items to component options
        const componentOptions = category.items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price || 0,
          type: item.type || categoryId,
          subtype: item.subtype,
          specs: item.specs || [],
          isHardware: item.isHardware,
          metadata: item.metadata || {}
        }));
        
        console.log(`[useComponentOptions] Loaded ${componentOptions.length} options for category ${categoryId}:`, componentOptions);
        setOptions(componentOptions);
        
        // If we have a selected option, try to find its match in the new options
        if (selectedOption && componentOptions.length > 0) {
          const matchedOption = findMatchingComponent(selectedOption, componentOptions);
          setMatchedSelectedOption(matchedOption || selectedOption);
        }
      } else {
        console.warn(`[useComponentOptions] No items found for category: ${categoryId} (mapped: ${mappedCategoryId})`);
        setOptions([]);
      }
      
      setError(null);
    } catch (err) {
      console.error(`[useComponentOptions] Error loading component options for ${categoryId}:`, err);
      toast.error(`Erro ao carregar opções para ${categoryId}`, {
        description: "Verifique a conexão e tente novamente."
      });
      setOptions([]);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao carregar opções'));
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, selectedOption]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  // Directly expose the refetch function
  const refetch = useCallback(() => {
    return loadOptions();
  }, [loadOptions]);

  return { options, isLoading, error, matchedSelectedOption, refetch };
}
