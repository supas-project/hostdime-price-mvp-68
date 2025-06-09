
import { useEffect, useState } from "react";
import { PriceData } from "@/types/pricing";

export function useCategoryManagement(priceData: PriceData, activeTab: string, setActiveTab: (tab: string) => void) {
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  useEffect(() => {
    if (priceData) {
      const categoryIds = Object.keys(priceData);
      setAvailableCategories(categoryIds);
      console.log("[useCategoryManagement] Categorias disponíveis atualizadas:", categoryIds.join(", "));
      
      if (activeTab && !categoryIds.includes(activeTab) && categoryIds.length > 0) {
        console.log(`[useCategoryManagement] Categoria ativa ${activeTab} não existe mais, alterando para ${categoryIds[0]}`);
        setActiveTab(categoryIds[0]);
      }
    }
  }, [priceData, activeTab, setActiveTab]);

  const handleDeleteCategory = async (categoryId: string, onDeleteCategory: (id: string) => Promise<boolean>) => {
    const success = await onDeleteCategory(categoryId);
    
    if (success) {
      console.log(`[useCategoryManagement] Categoria ${categoryId} excluída com sucesso`);
      
      if (categoryId === activeTab) {
        const remainingCategories = availableCategories.filter(id => id !== categoryId);
        if (remainingCategories.length > 0) {
          console.log(`[useCategoryManagement] Alterando categoria ativa para ${remainingCategories[0]}`);
          setActiveTab(remainingCategories[0]);
        }
      }
    }
    
    return success;
  };

  return {
    availableCategories,
    handleDeleteCategory
  };
}
