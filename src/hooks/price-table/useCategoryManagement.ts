
import { useEffect, useState } from "react";
import { PriceData } from "@/types/pricing";

export function useCategoryManagement(priceData: PriceData, activeTab: string, setActiveTab: (tab: string) => void) {
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  useEffect(() => {
    if (priceData) {
      const categoryIds = Object.keys(priceData);
      setAvailableCategories(categoryIds);
      console.log("[useCategoryManagement] Categorias disponíveis atualizadas:", categoryIds.join(", "));
      
      // Only change active tab if current one doesn't exist and we have categories
      if (activeTab && !categoryIds.includes(activeTab) && categoryIds.length > 0) {
        const newActiveTab = categoryIds[0];
        console.log(`[useCategoryManagement] Categoria ativa ${activeTab} não existe mais, alterando para ${newActiveTab}`);
        setActiveTab(newActiveTab);
      }
    }
  }, [priceData, activeTab, setActiveTab]);

  const handleDeleteCategory = async (categoryId: string, onDeleteCategory: (id: string) => Promise<boolean>) => {
    console.log(`[useCategoryManagement] Iniciando exclusão da categoria ${categoryId}`);
    
    try {
      const success = await onDeleteCategory(categoryId);
      
      if (success) {
        console.log(`[useCategoryManagement] Categoria ${categoryId} excluída com sucesso`);
        
        // Update available categories immediately
        const updatedCategories = availableCategories.filter(id => id !== categoryId);
        setAvailableCategories(updatedCategories);
        
        // If deleted category was the active one, switch to another category
        if (categoryId === activeTab) {
          if (updatedCategories.length > 0) {
            const newActiveTab = updatedCategories[0];
            console.log(`[useCategoryManagement] Alterando categoria ativa para ${newActiveTab}`);
            setActiveTab(newActiveTab);
          } else {
            console.log(`[useCategoryManagement] Nenhuma categoria restante, mantendo tab ativa`);
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
