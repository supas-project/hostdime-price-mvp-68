
import { useEffect, useState } from "react";
import { PriceData } from "@/types/pricing";

export function useCategoryManagement(priceData: PriceData, activeTab: string, setActiveTab: (tab: string) => void) {
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  useEffect(() => {
    if (priceData) {
      const categoryIds = Object.keys(priceData);
      setAvailableCategories(categoryIds);
      console.log("[useCategoryManagement] Categorias disponíveis atualizadas:", categoryIds.join(", "));
      
      // If current active tab doesn't exist and we have categories, switch to first one
      if (activeTab && !categoryIds.includes(activeTab) && categoryIds.length > 0) {
        const newActiveTab = categoryIds[0];
        console.log(`[useCategoryManagement] Categoria ativa ${activeTab} não existe mais, alterando para ${newActiveTab}`);
        setActiveTab(newActiveTab);
      } else if (categoryIds.length === 0) {
        console.log(`[useCategoryManagement] Nenhuma categoria disponível`);
        setActiveTab("");
      } else if (!activeTab && categoryIds.length > 0) {
        console.log(`[useCategoryManagement] Nenhuma categoria ativa, definindo primeira categoria como ativa: ${categoryIds[0]}`);
        setActiveTab(categoryIds[0]);
      }
    }
  }, [priceData, activeTab, setActiveTab]);

  const handleDeleteCategory = async (categoryId: string, onDeleteCategory: (id: string) => Promise<boolean>) => {
    console.log(`[useCategoryManagement] Iniciando exclusão da categoria ${categoryId}`);
    
    try {
      const success = await onDeleteCategory(categoryId);
      
      if (success) {
        console.log(`[useCategoryManagement] Categoria ${categoryId} excluída com sucesso`);
        
        // Handle tab switching immediately if the deleted category was active
        if (categoryId === activeTab) {
          const currentCategories = Object.keys(priceData || {});
          const remainingCategories = currentCategories.filter(id => id !== categoryId);
          
          if (remainingCategories.length > 0) {
            console.log(`[useCategoryManagement] Mudando aba ativa de ${categoryId} para ${remainingCategories[0]}`);
            setActiveTab(remainingCategories[0]);
          } else {
            console.log(`[useCategoryManagement] Nenhuma categoria restante, limpando aba ativa`);
            setActiveTab("");
          }
        }
        
        return true;
      } else {
        console.error(`[useCategoryManagement] Falha ao excluir categoria ${categoryId}`);
        return false;
      }
    } catch (error) {
      console.error(`[useCategoryManagement] Erro ao excluir categoria ${categoryId}:`, error);
      return false;
    }
  };

  return {
    availableCategories,
    handleDeleteCategory
  };
}
