
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAppStore } from "@/store/appStore";
import { toast } from "@/utils/toast-utils";

export function useCategoryAdd(setPriceData: (data: any) => void) {
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();
  
  const handleAddCategory = async (values: any) => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para adicionar categorias."
      });
      return null;
    }
    
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

  return {
    openAddCategory,
    setOpenAddCategory,
    handleAddCategory
  };
}
