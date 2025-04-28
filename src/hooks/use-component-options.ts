
import { useState, useEffect, useRef } from "react";
import { ComponentOption } from "@/types/component";
import { PriceService } from "@/services/price-service";

/**
 * Hook para obter opções de componentes da tabela de preços
 * @param categoryId - ID da categoria na tabela de preços
 * @returns Array de opções de componentes
 */
export function useComponentOptions(categoryId: string): {
  options: ComponentOption[];
  isLoading: boolean;
  error: Error | null;
} {
  const [options, setOptions] = useState<ComponentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Usar useRef para armazenar a função de callback para evitar recriação
  const fetchOptionsRef = useRef<() => void>();

  useEffect(() => {
    // Definir a função de busca de opções
    const fetchOptions = () => {
      try {
        setIsLoading(true);
        const category = PriceService.getCategory(categoryId);
        
        if (category && Array.isArray(category.items)) {
          // Converter itens da categoria para ComponentOption
          const componentOptions: ComponentOption[] = category.items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            specs: Array.isArray(item.specs) ? item.specs : [],
            type: item.type,
            subtype: item.subtype,
            metadata: item.metadata
          }));
          
          setOptions(componentOptions);
        } else {
          setOptions([]);
        }
        
        setError(null);
      } catch (err) {
        console.error(`Erro ao carregar opções de ${categoryId}:`, err);
        setError(err instanceof Error ? err : new Error(`Erro ao carregar opções de ${categoryId}`));
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Armazenar referência da função para remover listener depois
    fetchOptionsRef.current = fetchOptions;
    
    // Executar busca inicial
    fetchOptions();

    // Registrar listener para mudanças na tabela de preços
    PriceService.addDataChangeListener(fetchOptions);
    
    // Cleanup: remover listener quando componente for desmontado
    return () => {
      // Usar a referência armazenada para remover o listener específico
      if (fetchOptionsRef.current) {
        PriceService.removeDataChangeListener(fetchOptionsRef.current);
      }
    };
  }, [categoryId]);

  return { options, isLoading, error };
}
