
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/auth/UnifiedAuthContext";
import { toast } from "@/utils/toast-utils";

export function useCategoryDelete(setPriceData: (data: any) => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();
  
  const handleDeleteCategory = async (categoryId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para excluir categorias."
      });
      return false;
    }
    
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem excluir categorias."
      });
      return false;
    }
    
    try {
      setIsDeleting(true);
      console.log(`[CategoryDelete] Iniciando exclusão da categoria ${categoryId}`);
      
      // Get current data before deletion for category name
      const beforeData = await PriceService.getAllData();
      const category = beforeData[categoryId];
      
      if (!category) {
        console.warn(`[CategoryDelete] Categoria ${categoryId} não encontrada`);
        toast.error("Categoria não encontrada", {
          description: "A categoria não existe ou já foi removida."
        });
        return false;
      }
      
      const categoryName = category?.name || categoryId;
      console.log(`[CategoryDelete] Deletando categoria "${categoryName}" (${categoryId}) com ${category.items?.length || 0} itens`);
      
      // Execute category deletion - this is the main operation
      const success = await PriceService.deleteCategory(categoryId);
      
      if (!success) {
        console.error(`[CategoryDelete] PriceService.deleteCategory retornou false para ${categoryId}`);
        toast.error("Erro ao excluir categoria", {
          description: "A operação de exclusão falhou no servidor. Tente novamente."
        });
        return false;
      }
      
      console.log(`[CategoryDelete] PriceService.deleteCategory retornou true para ${categoryId}`);
      
      // Force refresh data from server to ensure UI sync
      try {
        const freshData = await PriceService.getAllData();
        console.log(`[CategoryDelete] Dados atualizados após exclusão:`, Object.keys(freshData).join(", "));
        
        // Double-check category was actually deleted
        if (freshData[categoryId]) {
          console.error(`[CategoryDelete] CRÍTICO: Categoria ${categoryId} ainda existe nos dados frescos!`);
          toast.error("Falha na exclusão", {
            description: "A categoria não foi completamente removida do servidor."
          });
          return false;
        }
        
        // Update local state with fresh data immediately
        setPriceData(freshData);
        console.log(`[CategoryDelete] Estado local atualizado - categoria ${categoryId} removida com sucesso`);
        
      } catch (fetchError) {
        console.error(`[CategoryDelete] Erro ao buscar dados frescos:`, fetchError);
        // Even if we can't fetch fresh data, if deleteCategory returned true, 
        // we should trust it and update local state optimistically
        const optimisticData = { ...beforeData };
        delete optimisticData[categoryId];
        setPriceData(optimisticData);
        console.log(`[CategoryDelete] Usando atualização otimista do estado local`);
      }
      
      // Register change for notification
      await registerAdminChange("delete_category", `Categoria "${categoryName}" excluída`);
      
      toast.success("Categoria excluída", {
        description: `A categoria "${categoryName}" foi excluída com sucesso.`
      });
      
      return true;
    } catch (error) {
      console.error("[CategoryDelete] Erro inesperado ao excluir categoria:", error);
      toast.error("Erro inesperado", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado ao excluir a categoria."
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDeleteCategory
  };
}
