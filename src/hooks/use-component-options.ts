
import { useState, useEffect, useRef, useMemo } from "react";
import { ComponentOption } from "@/types/component";
import { PriceService } from "@/services/price-service";
import { normalizeComponentType } from "./use-component-selection";

/**
 * Hook para obter opções de componentes da tabela de preços
 * @param categoryId - ID da categoria na tabela de preços
 * @param selectedOption - Opção selecionada para sincronizar o visual com o estado global
 * @returns Array de opções de componentes, estado de carregamento e erro
 */
export function useComponentOptions(
  categoryId: string, 
  selectedOption?: ComponentOption | null
): {
  options: ComponentOption[];
  isLoading: boolean;
  error: Error | null;
  matchedSelectedOption: ComponentOption | null;
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
            isHardware: item.isHardware,
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

  // Sincronizar e encontrar a opção selecionada no array de opções disponíveis
  const matchedSelectedOption = useMemo(() => {
    if (!selectedOption || options.length === 0) return null;
    
    // Normalizar tipo do componente para comparação consistente
    const normalizedType = normalizeComponentType(selectedOption.type);
    
    // Tenta encontrar pelo ID exato primeiro
    const exactIdMatch = options.find(opt => opt.id === selectedOption.id);
    if (exactIdMatch) return exactIdMatch;
    
    // Tenta encontrar por nome exato
    const nameMatch = options.find(opt => opt.name === selectedOption.name);
    if (nameMatch) return nameMatch;
    
    // Tenta encontrar por nome normalizado (removendo caracteres especiais, etc)
    const normalizedName = selectedOption.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedMatch = options.find(opt => 
      opt.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedName
    );
    
    return normalizedMatch || null;
  }, [selectedOption, options]);

  return { 
    options, 
    isLoading, 
    error,
    matchedSelectedOption 
  };
}
