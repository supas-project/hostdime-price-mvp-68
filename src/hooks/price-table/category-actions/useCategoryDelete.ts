
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/utils/toast-utils";

export function useCategoryDelete(setPriceData: (data: any) => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();
  
  const handleDeleteCategory = async (categoryId: string) => {
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
      
      // Get category name before deleting for message
      const category = await PriceService.getCategory(categoryId);
      const categoryName = category?.name || categoryId;
      
      // Execute category deletion
      const success = await PriceService.deleteCategory(categoryId);
      
      if (!success) {
        throw new Error("Falha ao excluir a categoria. Tente novamente.");
      }
      
      // Get updated data after deletion
      const updatedData = await PriceService.getAllData();
      
      // Log para debug - verificar se a categoria foi removida dos dados
      console.log(`[CategoryDelete] Categoria ${categoryId} removida. Categorias restantes:`, 
        Object.keys(updatedData).join(", "));
      
      // Importante: Atualizar o estado com os dados atualizados
      setPriceData(updatedData);
      
      // Register change for notification
      await registerAdminChange("delete_category", `Categoria "${categoryName}" excluída`);
      
      toast.success("Categoria excluída", {
        description: "A categoria foi excluída com sucesso."
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
