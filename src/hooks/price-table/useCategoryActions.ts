
import { useState } from "react";
import { PriceCategory } from "@/types/pricing";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useCategoryActions(setPriceData: (data: any) => void) {
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const { toast: uiToast } = useToast();
  const { registerAdminChange } = useDataSync();
  const { isAdmin, user } = useAuth();
  
  // Explicit check to ensure admin access
  const isAdminAccess = isAdmin || user?.email === "admin@hostdime.com.br";

  const handleAddCategory = async (values: any) => {
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem adicionar categorias."
      });
      return null;
    }
    
    try {
      // Only pass the allowed properties to addCategory
      const categoryData = {
        name: values.name,
        id: values.id || undefined
      };
      
      const newCategory = await PriceService.addCategory(categoryData);
      
      // Get the updated data after adding a category
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      setOpenAddCategory(false);
      
      // Register change for notification
      await registerAdminChange("add_category", `Categoria "${newCategory.name}" adicionada`);
      
      toast.success("Categoria adicionada", {
        description: `A categoria ${newCategory.name} foi adicionada com sucesso.`
      });
      
      return newCategory.id;
    } catch (error) {
      toast.error("Erro ao adicionar categoria", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
      return null;
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem excluir categorias."
      });
      return false;
    }
    
    try {
      // Get category name before deleting for message
      const category = await PriceService.getCategory(categoryId);
      const categoryName = category?.name || categoryId;
      
      await PriceService.deleteCategory(categoryId);
      
      // Get updated data after deletion
      const updatedData = await PriceService.getAllData();
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
    }
  };

  return {
    openAddCategory,
    setOpenAddCategory,
    handleAddCategory,
    handleDeleteCategory,
  };
}
