
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
      
      // Get current data before deletion
      const allData = await PriceService.getAllData();
      const category = allData[categoryId];
      
      if (!category) {
        console.warn(`[CategoryDelete] Categoria ${categoryId} não encontrada`);
        toast.error("Categoria não encontrada", {
          description: "A categoria não existe ou já foi removida."
        });
        return false;
      }
      
      const categoryName = category?.name || categoryId;
      
      console.log(`[CategoryDelete] Deletando categoria ${categoryId} com ${category.items?.length || 0} itens`);
      
      // Execute category deletion
      const success = await PriceService.deleteCategory(categoryId);
      
      if (!success) {
        throw new Error("Falha na operação de exclusão no servidor.");
      }
      
      console.log(`[CategoryDelete] Categoria ${categoryId} removida com sucesso pelo serviço`);
      
      // Force immediate state update - remove category from current data
      const currentData = await PriceService.getAllData();
      console.log(`[CategoryDelete] Dados atualizados após exclusão. Categorias restantes:`, 
        Object.keys(currentData).join(", "));
      
      // Ensure the category was actually removed from the data
      if (currentData[categoryId]) {
        console.error(`[CategoryDelete] Categoria ${categoryId} ainda existe no servidor após exclusão`);
        throw new Error("A categoria não foi completamente removida do servidor.");
      }
      
      // Update state immediately with fresh data
      setPriceData(currentData);
      
      // Register change for notification
      await registerAdminChange("delete_category", `Categoria "${categoryName}" excluída`);
      
      toast.success("Categoria excluída", {
        description: `A categoria "${categoryName}" foi excluída com sucesso.`
      });
      
      return true;
    } catch (error) {
      console.error("[CategoryDelete] Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir categoria", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
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
