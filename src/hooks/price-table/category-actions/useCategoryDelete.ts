
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/AuthContext";
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
      
      await PriceService.deleteCategory(categoryId);
      
      // Ensure data is saved to the database
      const updatedData = await PriceService.getAllData();
      await PriceService.saveData(updatedData);
      
      // Update local state
      setPriceData(updatedData);
      
      // Register change for notification
      await registerAdminChange("delete_category", `Categoria "${categoryName}" excluída`);
      
      toast.success("Categoria excluída", {
        description: "A categoria foi excluída com sucesso."
      });
      
      return true;
    } catch (error) {
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
