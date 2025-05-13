
import { useState } from "react";
import { PriceCategory } from "@/types/pricing";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";

export function useCategoryActions(setPriceData: (data: any) => void) {
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const { toast } = useToast();

  const handleAddCategory = (values: any) => {
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
      
      toast.success({
        title: "Categoria adicionada",
        description: `A categoria ${newCategory.name} foi adicionada com sucesso.`
      });
      
      return newCategory.id;
    } catch (error) {
      toast.error({
        title: "Erro ao adicionar categoria",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    try {
      PriceService.deleteCategory(categoryId);
      
      setPriceData(prev => {
        const updatedData = { ...prev };
        delete updatedData[categoryId];
        return updatedData;
      });
      
      toast.success({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso."
      });
      
      return true;
    } catch (error) {
      toast.error({
        title: "Erro ao excluir categoria",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
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
