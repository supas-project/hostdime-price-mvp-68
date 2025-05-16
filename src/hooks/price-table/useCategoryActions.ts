
import { useState } from "react";
import { PriceCategory } from "@/types/pricing";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/AuthContext";

export function useCategoryActions(setPriceData: (data: any) => void) {
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const { toast } = useToast();
  const { registerAdminChange } = useDataSync();
  const { isAdmin } = useAuth();

  const handleAddCategory = (values: any) => {
    if (!isAdmin) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem adicionar categorias."
      });
      return null;
    }
    
    try {
      const newCategory = PriceService.addCategory({
        name: values.name,
        items: []
      });
      
      setPriceData(prev => ({
        ...prev,
        [newCategory.id]: newCategory
      }));
      
      setOpenAddCategory(false);
      
      // Registra a mudança para notificação
      registerAdminChange("add_category", `Categoria "${newCategory.name}" adicionada`);
      
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

  const handleDeleteCategory = (categoryId: string) => {
    if (!isAdmin) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem excluir categorias."
      });
      return false;
    }
    
    try {
      // Obtém o nome da categoria antes de excluí-la para a mensagem
      const categoryName = PriceService.getCategory(categoryId)?.name || categoryId;
      
      PriceService.deleteCategory(categoryId);
      
      setPriceData(prev => {
        const updatedData = { ...prev };
        delete updatedData[categoryId];
        return updatedData;
      });
      
      // Registra a mudança para notificação
      registerAdminChange("delete_category", `Categoria "${categoryName}" excluída`);
      
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
