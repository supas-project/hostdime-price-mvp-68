
import { useEffect } from "react";
import { PriceData } from "@/types/pricing";

interface PriceDataProcessorProps {
  priceData: PriceData;
  setPriceData: (data: PriceData) => void;
}

export function PriceDataProcessor({ priceData, setPriceData }: PriceDataProcessorProps) {
  useEffect(() => {
    if (!priceData || typeof priceData !== 'object') {
      return;
    }

    // Filtrar categorias vazias ou inválidas
    const filteredData: PriceData = {};
    let hasChanges = false;

    for (const [categoryId, categoryData] of Object.entries(priceData)) {
      if (!categoryData || typeof categoryData !== 'object') {
        console.warn(`[PriceDataProcessor] Removing invalid category: ${categoryId}`);
        hasChanges = true;
        continue;
      }

      const category = categoryData as any;
      
      // Verificar se a categoria tem itens válidos
      if (!category.items || !Array.isArray(category.items)) {
        console.warn(`[PriceDataProcessor] Category ${categoryId} has no valid items array`);
        
        // Apenas manter categorias essenciais mesmo sem itens
        const essentialCategories = ['memory', 'processor', 'contract', 'datacenter', 'sistemaoperacional'];
        if (essentialCategories.includes(categoryId)) {
          filteredData[categoryId] = {
            ...category,
            items: []
          };
        } else {
          hasChanges = true;
        }
        continue;
      }

      // Filtrar itens válidos
      const validItems = category.items.filter((item: any) => 
        item && 
        typeof item === 'object' && 
        item.name && 
        typeof item.name === 'string' && 
        item.name.trim() !== '' &&
        (item.price !== undefined && item.price !== null)
      );

      // Verificar se houve mudança nos itens
      if (validItems.length !== category.items.length) {
        hasChanges = true;
      }

      // Manter categorias essenciais mesmo vazias, outras apenas se tiverem itens
      const essentialCategories = ['memory', 'processor', 'contract', 'datacenter', 'sistemaoperacional'];
      if (validItems.length > 0 || essentialCategories.includes(categoryId)) {
        filteredData[categoryId] = {
          ...category,
          items: validItems
        };
      } else {
        console.warn(`[PriceDataProcessor] Removing empty category: ${categoryId}`);
        hasChanges = true;
      }
    }

    // Se houve mudanças, atualizar o estado
    if (hasChanges) {
      console.log("[PriceDataProcessor] Updating price data to remove empty categories");
      setPriceData(filteredData);
    }
  }, [priceData, setPriceData]);

  return null;
}
