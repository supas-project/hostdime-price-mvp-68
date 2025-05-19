
import { useState, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { PriceService } from "@/services/price-service";
import { findMatchingComponent } from "@/utils/component-matching";
import { toast } from "sonner";

export function useComponentOptions(categoryId: string, selectedOption?: ComponentOption | null) {
  const [options, setOptions] = useState<ComponentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [matchedSelectedOption, setMatchedSelectedOption] = useState<ComponentOption | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoading(true);
      try {
        // Get category data from price service
        const category = await PriceService.getCategory(categoryId);
        
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
          console.warn(`[useComponentOptions] No items found for category: ${categoryId}`);
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
    };
    
    if (categoryId) {
      loadOptions();
    } else {
      setOptions([]);
      setIsLoading(false);
      setError(null);
    }
  }, [categoryId, selectedOption]);

  return { options, isLoading, error, matchedSelectedOption };
}
