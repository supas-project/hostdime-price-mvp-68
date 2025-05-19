
import { useState, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { PriceService } from "@/services/price-service";

export function useComponentOptions(categoryId: string) {
  const [options, setOptions] = useState<ComponentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoading(true);
      try {
        const category = await PriceService.getCategory(categoryId);
        
        // Check if the category exists and has items
        if (category && category.items && category.items.length > 0) {
          // Convert price items to component options
          const componentOptions = category.items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            type: item.type,
            subtype: item.subtype,
            specs: item.specs || [],
            metadata: item.metadata || {}
          }));
          
          setOptions(componentOptions);
        } else {
          console.log(`No items found for category: ${categoryId}`);
          setOptions([]);
        }
      } catch (error) {
        console.error(`Error loading component options for ${categoryId}:`, error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (categoryId) {
      loadOptions();
    } else {
      setOptions([]);
      setIsLoading(false);
    }
  }, [categoryId]);

  return { options, isLoading };
}
